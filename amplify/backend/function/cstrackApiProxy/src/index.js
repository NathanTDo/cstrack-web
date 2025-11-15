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
      region: process.env.AWS_REGION,
    });
    // Use the secret name you configured (e.g., SteamWebApiKey or STEAMWEBAPI_KEY)
    const secretName =
      process.env.SteamWebApiKey || process.env.STEAMWEBAPI_KEY;
    if (!secretName)
      throw new Error("SteamWebAPI key secret name not configured.");

    const cmd = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsClient.send(cmd);
    const STEAMWEBAPI_KEY = JSON.parse(response.SecretString)[
      secretName.split("/").pop()
    ];

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

    const baseImageMap = new Map(); // Cache for base item names -> image URLs
    const getBaseName = (marketHashName) => {
      const match = marketHashName.match(/(.+?)\s+\(/);
      return match ? match[1] : marketHashName;
    };

    // This loop fetches images for UNIQUE base items one-by-one
    for (const item of filteredItems) {
      const baseName = getBaseName(item.market_hash_name);
      if (!baseImageMap.has(baseName)) {
        // We haven't seen this base item yet, so fetch its image
        try {
          const steamUrl = `https://www.steamwebapi.com/steam/api/item?key=${STEAMWEBAPI_KEY}&market_hash_name=${encodeURIComponent(
            item.market_hash_name // Use the full name for the first lookup
          )}`;

          const steamRes = await fetch(steamUrl);
          console.log(
            `[SteamAPI] Status for ${item.market_hash_name}: ${steamRes.status}`
          );

          let imageUrl = null;
          if (steamRes.ok) {
            const steamData = await steamRes.json();
            // Try different common field names for the image
            imageUrl =
              steamData.image || steamData.icon_url || steamData.icon_url_large;
          } else {
            const errorBody = await steamRes.text();
            console.warn(
              `[SteamAPI] Failed for ${item.market_hash_name}. Status: ${steamRes.status}, Body: ${errorBody}`
            );
          }
          baseImageMap.set(baseName, imageUrl); // Cache the result (even if null)

          // Crucial: Add a tiny delay between Steam calls to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (err) {
          console.error(
            `[SteamAPI] CRITICAL ERROR for ${item.market_hash_name}:`,
            err
          );
          baseImageMap.set(baseName, null); // Cache failures too
        }
      }
    }

    // Now, map the cached images back to all the filtered items
    const enrichedResults = filteredItems.map((item) => {
      const baseName = getBaseName(item.market_hash_name);
      return {
        ...item,
        image: baseImageMap.get(baseName) || null,
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
