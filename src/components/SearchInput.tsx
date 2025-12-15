import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative flex items-center glass rounded-2xl transition-all duration-500
          ${isFocused ? "shadow-glow scale-[1.02]" : "shadow-soft"}
        `}
      >
        <div className="absolute left-5 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <Search className={`h-5 w-5 transition-colors duration-300 ${isFocused ? "text-foreground" : "text-muted-foreground"}`} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search Anything..."
          className="w-full bg-transparent py-5 pl-14 pr-32 text-lg font-medium placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-3 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in stagger-2">
        F*ck SEO • Finds Sites & Free Tools
      </p>
    </form>
  );
}
