"use client";

import React, { useState } from "react";
import { generateClient } from "aws-amplify/api";
import { createSkin } from "@/graphql/mutations";
import { Download, Check, X, Loader2 } from "lucide-react";

const API_BASE_URL = "https://sew3ob16e9.execute-api.us-west-1.amazonaws.com/dev";

// Type for inventory items from Steam
interface SteamInventoryItem {
  market_hash_name: string;
  quantity: number;
  image: string | null;
  suggested_price: number | null;
  wear: string | null;
  statTrak: boolean;
}

interface ImportInventoryProps {
  steamId: string;
  onImportComplete?: () => void;
}

export default function ImportInventory({ steamId, onImportComplete }: ImportInventoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [items, setItems] = useState<SteamInventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const client = generateClient();

  // Fetch inventory from Steam
  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    setItems([]);
    setSelectedItems(new Set());

    console.log("Fetching inventory for Steam ID:", steamId);

    try {
      const url = `${API_BASE_URL}/steam/inventory?steamId=${steamId}`;
      console.log("Fetching from:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("Inventory response:", data);

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to fetch inventory");
      }

      if (data.items && data.items.length > 0) {
        setItems(data.items);
      } else {
        setError("No tradeable items found in your inventory. Make sure your Steam inventory is public.");
      }
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      setError(err.message || "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal and fetch inventory
  const handleOpen = () => {
    setIsOpen(true);
    fetchInventory();
  };

  // Toggle item selection
  const toggleItem = (marketHashName: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(marketHashName)) {
        next.delete(marketHashName);
      } else {
        next.add(marketHashName);
      }
      return next;
    });
  };

  // Select/deselect all
  const toggleAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((i) => i.market_hash_name)));
    }
  };

  // Import selected items
  const handleImport = async () => {
    const itemsToImport = items.filter((i) => selectedItems.has(i.market_hash_name));
    
    if (itemsToImport.length === 0) {
      setError("Please select at least one item to import");
      return;
    }

    setIsImporting(true);
    setImportProgress({ current: 0, total: itemsToImport.length });

    try {
      for (let i = 0; i < itemsToImport.length; i++) {
        const item = itemsToImport[i];
        
        // Create skin in database
        await client.graphql({
          query: createSkin,
          variables: {
            input: {
              market_hash_name: item.market_hash_name,
              quantity: item.quantity,
              image: item.image,
              price: item.suggested_price,
              wear: item.wear,
              statTrak: item.statTrak,
              iconUrl: item.image,
            },
          },
          authMode: "userPool",
        });

        setImportProgress({ current: i + 1, total: itemsToImport.length });
      }

      // Success - close modal and notify parent
      setIsOpen(false);
      onImportComplete?.();
    } catch (err: any) {
      console.error("Error importing items:", err);
      setError(`Import failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Calculate total value of selected items
  const selectedValue = items
    .filter((i) => selectedItems.has(i.market_hash_name))
    .reduce((sum, i) => sum + (i.suggested_price || 0) * i.quantity, 0);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 bg-[#1b2838] hover:bg-[#2a475e] text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Download size={18} />
        <span>Import from Steam</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white">Import Steam Inventory</h2>
                <p className="text-sm text-zinc-400">
                  Select items to add to your portfolio
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={32} className="text-brand-theme animate-spin mb-4" />
                  <p className="text-zinc-400">Loading your Steam inventory...</p>
                </div>
              )}

              {error && !isLoading && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={fetchInventory}
                    className="mt-3 text-sm text-zinc-400 hover:text-white underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!isLoading && !error && items.length > 0 && (
                <>
                  {/* Select All */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={toggleAll}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {selectedItems.size === items.length ? "Deselect All" : "Select All"}
                    </button>
                    <p className="text-sm text-zinc-500">
                      {items.length} items found
                    </p>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {items.map((item) => {
                      const isSelected = selectedItems.has(item.market_hash_name);
                      return (
                        <div
                          key={item.market_hash_name}
                          onClick={() => toggleItem(item.market_hash_name)}
                          className={`relative bg-zinc-800 rounded-lg p-3 cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-brand-theme bg-brand-theme/10"
                              : "hover:bg-zinc-700"
                          }`}
                        >
                          {/* Checkbox indicator */}
                          <div
                            className={`absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center ${
                              isSelected ? "bg-brand-theme" : "bg-zinc-700"
                            }`}
                          >
                            {isSelected && <Check size={14} className="text-black" />}
                          </div>

                          {/* Item image */}
                          <div className="aspect-square mb-2 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.market_hash_name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-700 rounded flex items-center justify-center text-zinc-500">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Item info */}
                          <p className="text-xs text-zinc-300 line-clamp-2 mb-1">
                            {item.market_hash_name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">x{item.quantity}</span>
                            <span className="text-xs text-brand-theme font-mono">
                              {item.suggested_price
                                ? `$${item.suggested_price.toFixed(2)}`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !isLoading && (
              <div className="border-t border-zinc-800 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">
                    {selectedItems.size} items selected
                  </p>
                  <p className="text-lg font-mono text-brand-theme">
                    ${selectedValue.toFixed(2)} total
                  </p>
                </div>
                <button
                  onClick={handleImport}
                  disabled={selectedItems.size === 0 || isImporting}
                  className="flex items-center gap-2 bg-brand-theme hover:bg-brand-theme-hover text-black font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>
                        Importing {importProgress.current}/{importProgress.total}...
                      </span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Import Selected</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
