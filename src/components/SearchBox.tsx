"use client";

import React, { useState } from "react";
import { get } from "aws-amplify/api";
import { MarketItem } from "@/types/types";
import SearchResultCard from "./SearchResultCard"; // Assuming SearchResultCard is in components
import { Search } from "lucide-react"; // Import icon

// --- 1. Define the name of your REST API ---
const apiName = "cstrackApiProxy"; // Make sure this matches `amplify status`

export default function SearchBox() {
  // --- 2. All state is now managed inside this component ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- 3. The API call logic is here ---
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent full page reload if called from form submit
    console.log(`[handleSearch] Starting search for: "${searchTerm}"`);

    if (!searchTerm.trim()) {
      alert("Please enter a search term.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    try {
      const path = `/search`;
      const options = {
        queryParams: {
          search: searchTerm,
        },
      };

      console.log(
        `[handleSearch] Requesting data from API: ${apiName}, Path: ${path}, Query: ${searchTerm}`
      );

      const restOperation = get({
        apiName: apiName,
        path: path,
        options: options,
      });

      console.log("[handleSearch] Waiting for response...");
      const { body, statusCode } = await restOperation.response;

      console.log("[handleSearch] Response received. Status:", statusCode);

      if (statusCode !== 200) {
        const errorText = await body.text();
        console.error("[handleSearch] Non-200 status:", statusCode, errorText);
        throw new Error(`API returned status ${statusCode}: ${errorText}`);
      }

      const responseBody = (await body.json()) as unknown as MarketItem[];
      console.log("[handleSearch] Parsed response body:", responseBody);

      setResults(responseBody);

      if (responseBody.length === 0) {
        setError("No items found matching your search.");
      }
    } catch (err: any) {
      console.error("[handleSearch] CRITICAL ERROR:", err);
      console.error("[handleSearch] Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: err.response,
      });
      setError(
        `Failed to fetch skins: ${err.message || "Check console logs."}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. The selection logic is also here ---
  const handleSelectSkin = (skin: MarketItem) => {
    console.log("[handleSelectSkin] Selected skin:", skin.market_hash_name);
    // TODO: Open modal to call createSkin GraphQL mutation
    // alert(`Add ${skin.market_hash_name} to your portfolio?`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const loadTestData = () => {
    const fakeItems: MarketItem[] = [
      {
        market_hash_name: "AK-47 | Redline (Field-Tested)",
        suggested_price: 15.5,
        image:
          "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsYD_1IdSQJgRsYAvW_1W4wL_n1p_uu5vLziQw7nEnsX7D30vg_x9vM9c",
        currency: "USD",
      },
      {
        market_hash_name: "★ Karambit | Fade (Factory New)",
        suggested_price: 1450.0,
        image:
          "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7v--YXygED6_0M4YGr2dY6VJ1NoaVgA_gLslOzqg56_v57MzSc17yQk5nnayRO30E1SLrs4V8sSgfw",
        currency: "USD",
      },
      {
        market_hash_name: "AWP | Dragon Lore (Field-Tested)",
        suggested_price: 4200.0,
        image:
          "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJM6dO4m4mZqPv9NLPF2G0H6sZ03rvD942n3QGx_RE9Zzv1I4fAdQI2YA2CqFe2k-zmh5C86ZSanCRi7CAn4XbD30vgU8J4P8w",
        currency: "USD",
      },
    ];
    setResults(fakeItems);
    setError(null);
  };

  // --- 5. The component renders its own UI ---
  return (
    <div className="flex flex-col items-center w-full">
      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-lg mb-4 relative flex items-center"
      >
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 z-10">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search for skins... (e.g., AK-47 Redline)"
          className="w-full h-12 pl-10 pr-32 rounded-md border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <button
            type="submit"
            disabled={isLoading}
            className="h-9 px-4 bg-amber-500 text-black rounded-md hover:bg-amber-400 transition-colors text-sm font-bold disabled:opacity-50"
          >
            {isLoading ? "..." : "Search"}
          </button>
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="h-9 px-4 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </form>

      <button
        onClick={loadTestData}
        className="mb-6 text-xs text-zinc-500 hover:text-amber-500 underline"
      >
        Load Test Data (Fake Items)
      </button>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-6">
          <p className="text-amber-500">Loading results...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="mt-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && results && results.length > 0 && (
        <div className="w-full max-w-6xl mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((item) => (
            <div key={item.market_hash_name} className="cursor-pointer">
              <SearchResultCard item={item} />
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {!isLoading && results && results.length === 0 && !error && (
        <div className="mt-6">
          <p className="text-zinc-500">No results found.</p>
        </div>
      )}
    </div>
  );
}
