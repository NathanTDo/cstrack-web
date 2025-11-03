/*
Use the following code to retrieve configured secrets from SSM:

const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');

const client = new SSMClient();
const { Parameters } = await client.send(new GetParametersCommand({
  Names: ["PRICEMPIRE_API_KEY"].map(secretName => process.env[secretName]),
  WithDecryption: true,
}));

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

// Helper function to safely parse a price
const getPriceValue = (price) => {
  const p = parseFloat(price);
  return !isNaN(p) && p > 0 ? p : null;
};

const normalizePricempirePayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  return [];
};

const PRICEEMPIRE_CDN_BASE = "https://cs2-cdn.pricempire.com";

const resolvePricempireImage = (item) => {
  const candidates = [
    item?.image,
    item?.img,
    item?.icon,
    item?.icon_url,
    item?.image_url,
  ];

  const imagePath = candidates.find(
    (value) => typeof value === "string" && value.length > 0
  );
  if (!imagePath) return null;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${PRICEEMPIRE_CDN_BASE}${imagePath}`;
  }

  return `${PRICEEMPIRE_CDN_BASE}/${imagePath}`;
};

exports.handler = async (event) => {
  try {
    // === 1. Get Search Term ===
    const searchTerm = event.queryStringParameters.search;
    if (!searchTerm) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify("Error: Missing search parameter."),
      };
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    console.log(`Searching for: ${searchTerm}`);

    // === 2. Get Pricempire API Key ===
    console.log("Retrieving Pricempire API Key...");
    const ssmClient = new SSMClient({ region: process.env.AWS_REGION });
    const secretName = process.env.PRICEMPIRE_API_KEY;
    if (!secretName)
      throw new Error("Pricempire secret name env var not configured.");

    const apiKeyCommand = new GetParameterCommand({
      Name: secretName,
      WithDecryption: true,
    });
    const apiKeyResponse = await ssmClient.send(apiKeyCommand);
    const PRICEMPIRE_API_KEY = apiKeyResponse.Parameter?.Value;
    if (!PRICEMPIRE_API_KEY)
      throw new Error("Could not retrieve Pricempire API Key from SSM.");
    console.log("Successfully retrieved Pricempire API Key.");

    // === 3. Prepare API Calls ===
    const pricempireUrl = `https://api.pricempire.com/v4/free/search?q=${encodeURIComponent(
      searchTerm
    )}`;
    const skinportUrl = `https://api.skinport.com/v1/items?app_id=730&currency=USD&tradable=true`;

    const pricempirePromise = fetch(pricempireUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PRICEMPIRE_API_KEY}`,
        Accept: "application/json",
      },
    });

    const skinportPromise = fetch(skinportUrl, {
      method: "GET",
      headers: { "Accept-Encoding": "br" },
    });

    console.log("Making parallel API calls to Pricempire and Skinport...");

    // Use Promise.allSettled to ensure both requests complete, even if one fails
    const [pricempireResult, skinportResult] = await Promise.allSettled([
      pricempirePromise,
      skinportPromise,
    ]);

    // === 4. Process Pricempire Results (Our "Base" List) ===
    let pricempireItems = [];
    let pricempireRawPayload = null;
    if (pricempireResult.status === "fulfilled" && pricempireResult.value.ok) {
      pricempireRawPayload = await pricempireResult.value.json();
      pricempireItems = normalizePricempirePayload(pricempireRawPayload);
      console.log(
        `Received ${pricempireItems.length} results from Pricempire.`
      );
      if (!Array.isArray(pricempireItems) || pricempireItems.length === 0) {
        console.warn("Pricempire payload did not contain an array of items.", {
          keys: pricempireRawPayload ? Object.keys(pricempireRawPayload) : [],
        });
      }
    } else {
      console.warn(
        "Pricempire API call failed:",
        pricempireResult.reason || pricempireResult.value?.statusText
      );
    }

    // === 5. Process Skinport Results (Our "Enrichment" Data) ===
    const skinportPriceMap = new Map();
    let skinportRawPayload = [];
    if (skinportResult.status === "fulfilled" && skinportResult.value.ok) {
      skinportRawPayload = await skinportResult.value.json();
      if (!Array.isArray(skinportRawPayload)) {
        console.warn("Skinport payload was not an array.", {
          payloadPreview: skinportRawPayload?.slice
            ? skinportRawPayload.slice(0, 3)
            : skinportRawPayload,
        });
        skinportRawPayload = [];
      }

      console.log(
        `Received ${skinportRawPayload.length} total items from Skinport.`
      );

      // Filter Skinport items and store them in a Map for fast lookup
      for (const item of skinportRawPayload) {
        if (
          item.market_hash_name?.toLowerCase?.().includes(lowercasedSearchTerm)
        ) {
          skinportPriceMap.set(item.market_hash_name, {
            suggested_price: getPriceValue(item.suggested_price),
            min_price: getPriceValue(item.min_price),
            median_price: getPriceValue(item.median_price),
          });
        }
      }
      console.log(
        `Filtered Skinport down to ${skinportPriceMap.size} relevant items.`
      );
    } else {
      console.warn(
        "Skinport API call failed:",
        skinportResult.reason || skinportResult.value?.statusText
      );
    }

    // === 6. Combine & Aggregate Results ===
    // We use Pricempire's results as the primary list
    const combinedResults = pricempireItems.map((pItem) => {
      const skinportMatch = skinportPriceMap.get(pItem.market_hash_name);

      const pPrice = getPriceValue(pItem.price); // Assumes Pricempire field is 'price'
      const sPrice = skinportMatch ? skinportMatch.suggested_price : null;

      const prices = [];
      if (pPrice) prices.push(pPrice);
      if (sPrice) prices.push(sPrice);

      let aggregate_price = null;
      if (prices.length > 0) {
        aggregate_price = prices.reduce((a, b) => a + b, 0) / prices.length;
        aggregate_price = parseFloat(aggregate_price.toFixed(2));
      }

      return {
        market_hash_name: pItem.market_hash_name,
        image: resolvePricempireImage(pItem),
        price: aggregate_price,
        aggregate_price,
        currency: pItem.currency || "USD",

        // You can add more data if you want
        // price_pricempire: pPrice,
        // price_skinport: sPrice,
        // skinport_min: skinportMatch ? skinportMatch.min_price : null,
      };
    });
    console.log(`Combined results into ${combinedResults.length} items.`);

    const includeRaw =
      event.queryStringParameters?.debug === "true" ||
      event.queryStringParameters?.debug === "1";

    let responsePayload = combinedResults;
    if (includeRaw) {
      responsePayload = {
        results: combinedResults,
        count: combinedResults.length,
        debug: {
          pricempire: pricempireRawPayload,
          skinport: skinportRawPayload,
        },
      };
    }

    // === 7. Return Aggregated Data ===
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responsePayload),
    };
  } catch (error) {
    console.error("FATAL ERROR in Lambda function:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
