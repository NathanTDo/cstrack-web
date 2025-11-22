import { MarketItem } from "@/types/types"; // Import our new type
import React, { useState } from "react";
import { AddSkinSheet } from "@/components/AddPortfolio";

// This component receives a single MarketItem as a prop
function SearchResultCard({ item }: { item: MarketItem }) {
  const [isOpen, setIsOpen] = useState(false);
  // Use a placeholder if the API image is missing
  const imageUrl = item.image;

  return (
    // You'll want to add Tailwind/shadcn classes here
    <div
      className="w-full h-full bg-[#27272A] rounded-lg p-6 shadow-lg border-zinc-800 border-2 hover:border-amber-500 transition-colors cursor-pointer flex flex-col items-center"
      onClick={() => setIsOpen(true)}
    >
      <div className="w-full aspect-[4/3] relative mb-4 flex items-center justify-center overflow-hidden rounded-md bg-zinc-900/50">
        <img
          src={imageUrl || "https://placehold.co/600x400?text=No+Image"}
          alt={item.market_hash_name}
          className="object-contain w-full h-full hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            // If the image fails to load, replace it with a transparent pixel or placeholder
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = "https://placehold.co/600x400?text=Error";
          }}
        />
      </div>

      <div className="search-result-details w-full text-center">
        {/* Display the item name */}
        <p className="item-name font-bold text-zinc-100 text-lg line-clamp-2 mb-2">
          {item.market_hash_name}
        </p>

        {/* Display the market price */}
        <p className="item-price text-amber-400 font-mono font-medium">
          {item.suggested_price
            ? `$${item.suggested_price.toFixed(2)} ${item.currency}`
            : "Price not available"}
        </p>
      </div>
      <AddSkinSheet item={item} isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

export default SearchResultCard;
