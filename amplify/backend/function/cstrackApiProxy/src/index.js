const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

// Configuration
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "us-west-1_aGCiofice";
const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";

// Helper to extract the "base name" by removing the wear (e.g., " (Field-Tested)")
const getBaseName = (marketHashName) => {
  return marketHashName.replace(/\s\([^)]+\)$/, "");
};

// Helper to create consistent response headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

// Extract Steam ID from OpenID claimed_id URL
const extractSteamId = (claimedId) => {
  const match = claimedId.match(/\/openid\/id\/(\d+)$/);
  return match ? match[1] : null;
};

// ============================================
// STEAM AUTH ENDPOINT - Generate OpenID URL
// ============================================
const handleSteamAuth = async (event) => {
  const returnTo = event.queryStringParameters?.returnTo || "http://localhost:3000/steam/callback";
  const realm = new URL(returnTo).origin;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const steamAuthUrl = `${STEAM_OPENID_URL}?${params.toString()}`;

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ authUrl: steamAuthUrl }),
  };
};

// ============================================
// STEAM VERIFY ENDPOINT - Verify & Link Account
// ============================================
const handleSteamVerify = async (event) => {
  try {
    // Parse the body (OpenID response params from frontend)
    const body = JSON.parse(event.body || "{}");
    const { openIdParams, username } = body;

    console.log("Received openIdParams:", JSON.stringify(openIdParams));
    console.log("Username:", username);

    if (!openIdParams || !username) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing openIdParams or username" }),
      };
    }

    // Build verification request to Steam
    // We need to send all params back with mode changed to check_authentication
    const verifyParams = new URLSearchParams();
    
    // Add all openid params from the response
    for (const [key, value] of Object.entries(openIdParams)) {
      if (key === "openid.mode") {
        // Change mode to check_authentication for verification
        verifyParams.append(key, "check_authentication");
      } else {
        verifyParams.append(key, value);
      }
    }

    console.log("Verification params:", verifyParams.toString());

    const verifyRes = await fetch(STEAM_OPENID_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
    });

    const verifyText = await verifyRes.text();
    console.log("Steam verification response:", verifyText);

    if (!verifyText.includes("is_valid:true")) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Steam verification failed", details: verifyText }),
      };
    }

    // Extract Steam ID from claimed_id
    const claimedId = openIdParams["openid.claimed_id"];
    const steamId = extractSteamId(claimedId);

    if (!steamId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Could not extract Steam ID" }),
      };
    }

    // Update Cognito user with Steam ID
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || "us-west-1",
    });

    await cognitoClient.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        UserAttributes: [
          { Name: "custom:steamId", Value: steamId },
        ],
      })
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, steamId }),
    };
  } catch (error) {
    console.error("Steam verify error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Verification failed", details: error.message }),
    };
  }
};

// ============================================
// STEAM INVENTORY ENDPOINT - Fetch User Inventory
// ============================================
const handleSteamInventory = async (event) => {
  try {
    const steamId = event.queryStringParameters?.steamId;

    if (!steamId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing steamId parameter" }),
      };
    }

    // Fetch inventory from Steam Community
    const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=500`;
    console.log("Fetching Steam inventory from:", inventoryUrl);
    
    const inventoryRes = await fetch(inventoryUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    
    console.log("Steam inventory response status:", inventoryRes.status);

    if (!inventoryRes.ok) {
      return {
        statusCode: inventoryRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: "Failed to fetch Steam inventory", 
          details: inventoryRes.status === 403 ? "Inventory is private" : `Status ${inventoryRes.status}`
        }),
      };
    }

    const inventoryData = await inventoryRes.json();

    if (!inventoryData.assets || !inventoryData.descriptions) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ items: [], message: "No items found or inventory is empty" }),
      };
    }

    // Create a map of classid+instanceid -> description
    const descriptionMap = {};
    inventoryData.descriptions.forEach((desc) => {
      const key = `${desc.classid}_${desc.instanceid}`;
      descriptionMap[key] = desc;
    });

    // Fetch Skinport prices for enrichment
    const skinportRes = await fetch(
      "https://api.skinport.com/v1/items?app_id=730&currency=USD",
      { headers: { "Accept-Encoding": "br" } }
    );
    
    let priceMap = {};
    if (skinportRes.ok) {
      const skinportItems = await skinportRes.json();
      skinportItems.forEach((item) => {
        priceMap[item.market_hash_name] = item.min_price || item.suggested_price;
      });
    }

    // Count quantities for each item
    const itemCounts = {};
    inventoryData.assets.forEach((asset) => {
      const key = `${asset.classid}_${asset.instanceid}`;
      const desc = descriptionMap[key];
      if (desc && desc.marketable === 1 && desc.market_hash_name) {
        const name = desc.market_hash_name;
        if (!itemCounts[name]) {
          itemCounts[name] = { count: 0, desc };
        }
        itemCounts[name].count += 1;
      }
    });

    // Build the final items array
    const items = Object.entries(itemCounts).map(([name, data]) => {
      const desc = data.desc;
      const iconUrl = desc.icon_url 
        ? `https://steamcommunity-a.akamaihd.net/economy/image/${desc.icon_url}`
        : null;

      return {
        market_hash_name: name,
        quantity: data.count,
        image: iconUrl,
        suggested_price: priceMap[name] || null,
        wear: extractWear(name),
        statTrak: name.includes("StatTrak™"),
      };
    });

    // Sort by price (highest first)
    items.sort((a, b) => (b.suggested_price || 0) - (a.suggested_price || 0));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ items, total: items.length }),
    };
  } catch (error) {
    console.error("Steam inventory error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to fetch inventory", details: error.message }),
    };
  }
};

// Helper to extract wear from market_hash_name
const extractWear = (name) => {
  const wearMatch = name.match(/\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)$/);
  return wearMatch ? wearMatch[1] : null;
};

// ============================================
// MAIN HANDLER - Route requests
// ============================================
exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  const path = event.path || "";

  // Route to appropriate handler
  if (path.includes("/steam/auth")) {
    return handleSteamAuth(event);
  }
  if (path.includes("/steam/verify")) {
    return handleSteamVerify(event);
  }
  if (path.includes("/steam/inventory")) {
    return handleSteamInventory(event);
  }

  // Default: Original search/price functionality
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
        headers: corsHeaders,
        body: JSON.stringify(priceMap),
      };
    }

    // === MODE B: NORMAL SEARCH ===
    if (!searchTerm) {
      return {
        statusCode: 400,
        headers: corsHeaders,
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
      headers: corsHeaders,
      body: JSON.stringify(enrichedResults),
    };
  } catch (error) {
    console.error("FATAL ERROR:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
