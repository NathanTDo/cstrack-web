import { Search } from "lucide-react";

export default function SearchBox() {
  return (
    // Total Card Container
    <div className="w-full bg-[#18181B] border border-zinc-700 rounded-lg p-6 shadow-lg mb-10">
      <h2 className="text-white text-xl font-semibold mb-4">Find a Product</h2>

      {/* 3. Form is now a flex container for the row layout, with spacing */}
      <form action="/search" className="w-full flex items-center space-x-2">
        {/* 4. Wrapper for Input + Icon (to keep icon inside) */}
        <div className="relative flex-1">
          {/* Search Icon */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search size={20} />
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Enter any skin or weapon..."
            className="w-full h-12 pl-10 bg-[#27272A] rounded-md border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="h-12 px-5 bg-[#F59E0B] text-white rounded-md hover:bg-teal-500 transition-colors text-sm font-medium"
        >
          Search
        </button>
      </form>
    </div>
  );
}
