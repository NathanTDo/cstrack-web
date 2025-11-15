import { MarketItem } from "@/types/types"; // Import our new type
import React, { useState } from "react";
import { AddSkinSheet } from "@/components/AddPortfolio";

// This component receives a single MarketItem as a prop
function SearchResultCard({ item }: { item: MarketItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  // Use a placeholder if the API image is missing
  const imageUrl = item.image;

  return (
    // You'll want to add Tailwind/shadcn classes here
    <div className="w-full h-full bg-[#27272A] rounded-lg p-6 shadow-lg border-zinc-800 border-2">
      <img src={imageUrl} alt={item.market_hash_name} />
      <div className="search-result-details">
        {/* Display the item name */}
        <p className="item-name">{item.market_hash_name}</p>

        {/* Display the market price */}
        <p className="item-price">
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
