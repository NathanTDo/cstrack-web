"use client";
import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { listSkins } from "@/graphql/queries";
import { PortfolioItem } from "@/types/types";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import SteamLink from "./SteamLink";
import ImportInventory from "./ImportInventory";

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({}); // Map: "AK-47": 10.50
  const [loading, setLoading] = useState(true);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [steamLoading, setSteamLoading] = useState(true);

  const client = generateClient();

  // Use your actual API Gateway URL (same as your Search URL)
  // It usually looks like: https://xyz.execute-api.us-west-2.amazonaws.com/dev/items
  const API_URL =
    "https://sew3ob16e9.execute-api.us-west-1.amazonaws.com/dev/search";

  useEffect(() => {
    fetchPortfolioAndPrices();
    checkSteamLink();
  }, []);

  // Check if user has linked their Steam account
  const checkSteamLink = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const linkedSteamId = attributes["custom:steamId"];
      if (linkedSteamId) {
        setSteamId(linkedSteamId);
      }
    } catch (err) {
      console.error("Error checking Steam link:", err);
    } finally {
      setSteamLoading(false);
    }
  };

  // Called when user links their Steam account
  const handleSteamLinkChange = (newSteamId: string | null) => {
    setSteamId(newSteamId);
  };

  // Called after items are imported - refresh the portfolio
  const handleImportComplete = () => {
    fetchPortfolioAndPrices();
  };

  const fetchPortfolioAndPrices = async () => {
    try {
      // 1. Fetch User's Items from DynamoDB
      const session = await fetchAuthSession();
      const result = await client.graphql({
        query: listSkins,
        authMode: "userPool",
      });

      const fetchedItems = result.data.listSkins.items;
      const validItems = fetchedItems.filter((item: any) => !item._deleted);

      // Save items to state immediately so the grid appears
      setItems(validItems as unknown as PortfolioItem[]);

      // 2. Fetch Live Prices (Only if we have items)
      if (validItems.length > 0) {
        // Create a comma-separated list of names: "AK-47 | Redline,AWP | Asiimov"
        const names = validItems.map((i: any) => i.market_hash_name).join(",");

        // Call your Lambda with the new "names" parameter
        const response = await fetch(
          `${API_URL}?names=${encodeURIComponent(names)}`
        );

        if (response.ok) {
          const priceMap = await response.json();
          console.log("Live Prices Loaded:", priceMap);
          setPrices(priceMap);
        } else {
          console.log("Failed to fetch live prices");
        }
      }
    } catch (error) {
      console.log("Detailed Error:", JSON.stringify(error, null, 2));
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely get price (defaults to 0 if loading/error)
  const getLivePrice = (marketName: string) => {
    return prices[marketName] || 0;
  };

  // 3. Calculate Total Value using LIVE prices
  const totalPortfolioValue = items.reduce((sum, item) => {
    const price = getLivePrice(item.market_hash_name);
    return sum + price * item.quantity;
  }, 0);

  if (loading)
    return <div className="p-10 text-white">Loading your skins...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      {/* --- HEADER SECTION: TOTAL VALUE --- */}
      <div className="mb-8 p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <p className="text-zinc-400 mt-1">
              Total items: {items.reduce((acc, item) => acc + item.quantity, 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-400 uppercase tracking-wide">
              Total Value (Live)
            </p>
            <p className="text-4xl font-mono text-brand-theme">
              ${totalPortfolioValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Steam Integration Section */}
        <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {steamLoading ? (
              <div className="text-sm text-zinc-500">Checking Steam link...</div>
            ) : steamId ? (
              <>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <svg className="w-5 h-5 text-[#1b2838]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17l3.37-4.83c-.02-.01-.03-.01-.05-.02-1.39-.54-2.31-1.87-2.31-3.41 0-2.03 1.64-3.67 3.67-3.67.34 0 .67.05.98.14l2.44-3.49C14.65 6.71 13.36 6 12 6c-3.31 0-6 2.69-6 6 0 2.39 1.4 4.44 3.42 5.41l-2.84 4.07C2.73 19.81 0 16.22 0 12 0 5.37 5.37 0 12 0zm0 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z"/>
                  </svg>
                  <span>Steam Linked</span>
                </div>
                <ImportInventory steamId={steamId} onImportComplete={handleImportComplete} />
              </>
            ) : (
              <SteamLink onLinkChange={handleSteamLinkChange} />
            )}
          </div>
        </div>
      </div>

      {/* --- GRID SECTION: THE CARDS --- */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p>No skins found. Go search and add some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const currentPrice = getLivePrice(item.market_hash_name);
            const subtotal = currentPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="bg-[#27272A] rounded-lg p-4 shadow-lg border border-zinc-800 flex flex-col items-center hover:border-zinc-600 transition-colors"
              >
                <div className="relative w-full aspect-[4/3] mb-4">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.market_hash_name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/placeholder.png";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-bold text-white">
                    x{item.quantity}
                  </div>
                </div>

                <h3 className="text-sm font-medium text-center text-zinc-200 line-clamp-2 h-10">
                  {item.market_hash_name}
                </h3>

                <div className="mt-4 w-full flex justify-between items-center border-t border-zinc-700 pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Unit Price</span>
                    {currentPrice > 0 ? (
                      <span className="text-sm">
                        ${currentPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-500 animate-pulse">
                        Loading...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm font-bold text-green-400">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
