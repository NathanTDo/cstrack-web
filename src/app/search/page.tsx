import SearchResultCard from "@/components/SearchResultCard";
import { MarketItem } from "@/types/types";
import "@/css/Search.css";
import SearchBox from "@/components/SearchBox";

function Search({ item }: { item: MarketItem }) {
  return (
    <div>
      <div className="w-full flex justify-center">
        <SearchBox />
      </div>
    </div>
  );
}

export default Search;
