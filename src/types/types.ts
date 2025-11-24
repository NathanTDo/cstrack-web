// This interface defines the "shape" of a search result from Pricempire.
// --- IMPORTANT ---
// You MUST check the JSON response from your invoke/mock test
// and make sure these field names (price, image) are correct!
export interface MarketItem {
  market_hash_name: string;
  suggested_price: number | null; // Or 'suggested_price', check the API response
  image: string; // Or 'icon_url', check the API response
  currency: string;
  wear: string;
  statTrak: boolean;
  // Add any other fields you want from the search result
}
