const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

// Helper to extract the "base name" by removing the wear (e.g., " (Field-Tested)")
const getBaseName = (marketHashName) => {
  return marketHashName.replace(/\s\([^)]+\)$/, "");
};

exports.handler = async (event) => {
  try {
    const searchTerm =
      event.queryStringParameters && event.queryStringParameters.search;
    const namesParam =
      event.queryStringParameters && event.queryStringParameters.names;

    // 1. Fetch ALL items from Skinport
    const skinportRes = await fetch(
      "https://api.skinport.com/v1/items?app_id=730&currency=USD",
      {
        headers: { "Accept-Encoding": "br" },
      }
    );
    if (!skinportRes.ok)
      throw new Error(`Skinport failed: ${skinportRes.status}`);
    const allSkinportItems = await skinportRes.json();

    // === MODE A: BULK PRICE CHECK (For Portfolio) ===
    if (namesParam) {
      console.log("Fetching live prices for specific items...");
      const requestedNames = namesParam.split(",");

      const priceMap = {};

      allSkinportItems.forEach((item) => {
        if (requestedNames.includes(item.market_hash_name)) {
          // If this item is in our list, save its price
          priceMap[item.market_hash_name] =
            item.min_price || item.suggested_price;
        }
      });

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(priceMap),
      };
    }

    // === MODE B: NORMAL SEARCH ===
    if (!searchTerm) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify("Error: Missing search parameter."),
      };
    }
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    // === 1. Get SteamWebAPI Key ===
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || process.env.REGION,
    });

    const secretName = process.env.STEAMWEBAPI_KEY;
    if (!secretName) {
      throw new Error("STEAMWEBAPI_KEY environment variable not configured.");
    }

    const cmd = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsClient.send(cmd);

    let STEAMWEBAPI_KEY;
    try {
      const secretObj = JSON.parse(response.SecretString);
      const keyName = secretName.split("/").pop();
      STEAMWEBAPI_KEY =
        secretObj[keyName] ||
        secretObj.STEAMWEBAPI_KEY ||
        secretObj.value ||
        secretObj.key;
    } catch (e) {
      STEAMWEBAPI_KEY = response.SecretString;
    }

    if (!STEAMWEBAPI_KEY) {
      throw new Error("Could not extract SteamWebAPI key from secret.");
    }

    // === 3. Filter Skinport Results Locally ===
    const filteredItems = allSkinportItems
      .filter((item) =>
        item.market_hash_name.toLowerCase().includes(lowerSearchTerm)
      )
      .slice(0, 24);

    // === 5. Enrich with Images from SteamWebAPI ===
    const baseImageMap = new Map();

    const getSharedImageName = (marketHashName) => {
      let base = marketHashName.replace(/\s\([^)]+\)$/, "");
      base = base.replace("StatTrak™ ", "");
      return base;
    };

    for (const item of filteredItems) {
      const imageKey = getSharedImageName(item.market_hash_name);

      if (!baseImageMap.has(imageKey)) {
        try {
          const queryName = `${imageKey} (Field-Tested)`;

          const steamUrl = `https://www.steamwebapi.com/steam/api/item?key=${STEAMWEBAPI_KEY}&market_hash_name=${encodeURIComponent(
            queryName
          )}`;

          const steamRes = await fetch(steamUrl);

          let imageUrl = null;
          if (steamRes.ok) {
            const steamData = await steamRes.json();
            imageUrl =
              steamData.image || steamData.icon_url || steamData.icon_url_large;
          } else {
            console.warn(`[SteamAPI] Failed: ${steamRes.status}`);
          }

          baseImageMap.set(imageKey, imageUrl);

          await new Promise((resolve) => setTimeout(resolve, 250));
        } catch (err) {
          console.error(`[SteamAPI] Error fetching image:`, err);
          baseImageMap.set(imageKey, null);
        }
      }
    }

    const enrichedResults = filteredItems.map((item) => {
      const imageKey = getSharedImageName(item.market_hash_name);
      return {
        ...item,
        image: baseImageMap.get(imageKey) || null,
      };
    });

    // === 6. Return Final Enriched Data ===
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrichedResults),
    };
  } catch (error) {
    console.error("FATAL ERROR:", error);
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
