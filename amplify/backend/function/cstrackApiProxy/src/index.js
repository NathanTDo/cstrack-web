const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

// Helper to extract the "base name" by removing the wear (e.g., " (Field-Tested)")
// This allows us to share one image across all wears of the same skin.
const getBaseName = (marketHashName) => {
  return marketHashName.replace(/\s\([^)]+\)$/, "");
};

exports.handler = async (event) => {
  try {
    const searchTerm = event.queryStringParameters.search;
    if (!searchTerm) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify("Error: Missing search parameter."),
      };
    }
    const lowerSearchTerm = searchTerm.trim().toLowerCase();
    console.log(`Searching for: "${lowerSearchTerm}"`);

    // === 1. Get SteamWebAPI Key ===
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || process.env.REGION,
    });
    // Use the secret name from environment variable
    const secretName = process.env.STEAMWEBAPI_KEY;
    if (!secretName) {
      throw new Error("STEAMWEBAPI_KEY environment variable not configured.");
    }

    console.log(`Fetching secret from: ${secretName}`);
    const cmd = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsClient.send(cmd);

    // Parse the secret - it could be a simple string or a JSON object
    let STEAMWEBAPI_KEY;
    try {
      const secretObj = JSON.parse(response.SecretString);
      // Try to get the key from the object - it might be under "STEAMWEBAPI_KEY" or the last part of the path
      const keyName = secretName.split("/").pop();
      STEAMWEBAPI_KEY =
        secretObj[keyName] ||
        secretObj.STEAMWEBAPI_KEY ||
        secretObj.value ||
        secretObj.key;
    } catch (e) {
      // If it's not JSON, treat it as a plain string
      STEAMWEBAPI_KEY = response.SecretString;
    }

    if (!STEAMWEBAPI_KEY) {
      throw new Error("Could not extract SteamWebAPI key from secret.");
    }
    console.log("Successfully retrieved SteamWebAPI key");

    // === 2. Fetch ALL items from Skinport (Public) ===
    console.log("Fetching all items from Skinport...");
    const skinportRes = await fetch(
      "https://api.skinport.com/v1/items?app_id=730&currency=USD",
      {
        headers: { "Accept-Encoding": "br" },
      }
    );
    if (!skinportRes.ok)
      throw new Error(`Skinport failed: ${skinportRes.status}`);
    const allSkinportItems = await skinportRes.json();
    console.log(`Got ${allSkinportItems.length} items from Skinport.`);

    // === 3. Filter Skinport Results Locally ===
    // We can increase the limit now since we are much more efficient with image calls
    const filteredItems = allSkinportItems
      .filter((item) =>
        item.market_hash_name.toLowerCase().includes(lowerSearchTerm)
      )
      .slice(0, 24);
    console.log(`Filtered down to top ${filteredItems.length} items.`);

    // === 5. Enrich with Images from SteamWebAPI (Smartly) ===
    console.log("Fetching images smartly from SteamWebAPI...");

    const baseImageMap = new Map();

    // Helper to normalize names so StatTrak and Normal share the same image
    const getSharedImageName = (marketHashName) => {
      // 1. Remove the wear (e.g. "(Field-Tested)")
      let base = marketHashName.replace(/\s\([^)]+\)$/, "");
      // 2. (Optional) Remove "StatTrak™ " so both versions share 1 image
      base = base.replace("StatTrak™ ", "");
      return base;
    };

    for (const item of filteredItems) {
      // We use a special "image key" to group items aggressively
      const imageKey = getSharedImageName(item.market_hash_name);

      if (!baseImageMap.has(imageKey)) {
        try {
          // Always force "(Field-Tested)" for the search query
          // This ensures we find the most common version of the image
          const queryName = `${imageKey} (Field-Tested)`;

          console.log(
            `Fetching image for group "${imageKey}" using: ${queryName}`
          );

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

          // === CRITICAL: DELAY ===
          // This prevents the "Internal Server Error" / "Missing Image"
          // We wait 250ms between external API calls
          await new Promise((resolve) => setTimeout(resolve, 250));
        } catch (err) {
          console.error(`[SteamAPI] Error fetching image:`, err);
          baseImageMap.set(imageKey, null);
        }
      }
    }

    // Map the results back
    const enrichedResults = filteredItems.map((item) => {
      // Use the same key generator to look up the image
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
