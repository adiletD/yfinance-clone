import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type SearchResult = {
  symbol: string;
  shortname: string;
  longname: string;
  exchDisp: string;
  typeDisp: string;
};

export default function StockSearch() {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch search results
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
    enabled: debouncedSearchTerm.length >= 2,
  });

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/stock/${searchTerm.trim().toUpperCase()}`);
      setSearchTerm("");
      setIsDropdownOpen(false);
    }
  };

  const handleResultClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search for a stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchResults && searchResults.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>
          )}
        </div>
        <Button type="submit" className="ml-2 hidden sm:flex">
          Search
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {isDropdownOpen && searchResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md mt-1 overflow-auto">
          <ul className="py-1">
            {searchResults.map((result) => (
              <li
                key={result.symbol}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleResultClick(result.symbol)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{result.symbol}</span>
                  <span className="text-xs text-gray-500">{result.exchDisp}</span>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {result.longname || result.shortname}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-1">
          Error searching for stocks. Please try again.
        </div>
      )}
    </div>
  );
}
