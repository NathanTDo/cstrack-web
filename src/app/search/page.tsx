import SearchResultCard from "@/components/SearchResultCard";
import { MarketItem } from "@/types/types";
import "@/css/Search.css";

const skins = [
  {
    __typename: "Skin" as const,
    id: "1",
    market_hash_name: "AK-47 | Redline (Field-Tested)",
    buyPrice: 100,
    quantity: 1,
    wear: "Field-Tested",
    statTrak: true,
    iconUrl:
      "https://cs2-cdn.pricempire.com/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_png.png",
  },
  {
    __typename: "Skin" as const,
    id: "2",
    market_hash_name: "AK-47 | Cobra Light (Field-Tested)",
    buyPrice: 150,
    quantity: 1,
    wear: "Field-Tested",
    iconUrl:
      "https://cs2-cdn.pricempire.com/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_png.png",
  },
  {
    __typename: "Skin" as const,
    id: "2",
    market_hash_name: "AK-47 | Cobra Light (Field-Tested)",
    buyPrice: 150,
    quantity: 1,
    wear: "Field-Tested",
    iconUrl:
      "https://cs2-cdn.pricempire.com/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_png.png",
  },
  {
    __typename: "Skin" as const,
    id: "2",
    market_hash_name: "AK-47 | Cobra Light (Field-Tested)",
    buyPrice: 150,
    quantity: 1,
    wear: "Field-Tested",
    iconUrl:
      "https://cs2-cdn.pricempire.com/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_png.png",
  },
  {
    __typename: "Skin" as const,
    id: "2",
    market_hash_name: "AK-47 | Cobra Light (Field-Tested)",
    buyPrice: 150,
    quantity: 1,
    wear: "Field-Tested",
    iconUrl:
      "https://cs2-cdn.pricempire.com/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_png.png",
  },
  {
    __typename: "Skin" as const,
    id: "2",
    market_hash_name: "AK-47 | Cobra Light (Field-Tested)",
    buyPrice: 150,
    quantity: 1,
    wear: "Field-Tested",
    iconUrl:
      "https://cs2-cdn.pricempire.com/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_png.png",
  },
];

function Search({ item }: { item: MarketItem }) {
  return (
    <div className="w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {skins.map((skin) => (
        <SearchResultCard
          key={skin.id}
          item={{
            market_hash_name: skin.market_hash_name,
            price: skin.buyPrice,
            image: skin.iconUrl,
            currency: "USD",
          }}
        />
      ))}
    </div>
  );
}

export default Search;
