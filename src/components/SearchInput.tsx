import { Search, Loader2, Mic } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { useAnimatedPlaceholder } from "@/hooks/useAnimatedPlaceholder";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { analytics } from "@/lib/analytics";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  externalQuery?: string;
}

type DropdownPos = { left: number; top: number; width: number };

export function SearchInput({ onSearch, isLoading, externalQuery }: SearchInputProps) {
  const [query, setQuery] = useState(externalQuery || "");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);

  const { isListening, transcript, isSupported, startListening, stopListening } =
    useVoiceSearch();
  const animatedPlaceholder = useAnimatedPlaceholder();
  const { suggestions } = useSearchSuggestions(query);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const updateDropdownPos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      left: rect.left,
      top: rect.bottom + 8,
      width: rect.width,
    });
  }, []);

  // Update query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  // Sync with external query changes
  useEffect(() => {
    if (externalQuery !== undefined) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  // Show suggestions when we have them and query is long enough
  useEffect(() => {
    if (suggestions.length > 0 && query.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [suggestions, query]);

  // Keep portal dropdown aligned with the input (scroll/resize)
  useEffect(() => {
    if (!showSuggestions) {
      setDropdownPos(null);
      return;
    }

    updateDropdownPos();

    const handle = () => updateDropdownPos();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [showSuggestions, updateDropdownPos]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setDropdownPos(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      analytics.track("search", { query: query.trim() });
      onSearch(query.trim());
      setShowSuggestions(false);
      setDropdownPos(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    analytics.track("search", { query: suggestion });
    onSearch(suggestion);
    setShowSuggestions(false);
    setDropdownPos(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setDropdownPos(null);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      analytics.track("voice_search", {});
      startListening();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto relative isolate z-30"
    >
      <div
        className={`
          relative flex items-center glass rounded-xl transition-all duration-300
          ${isFocused ? "shadow-glow scale-[1.01]" : "shadow-soft"}
        `}
      >
        <div className="absolute left-4 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search
              className={`h-4 w-4 transition-colors duration-300 ${
                isFocused ? "text-foreground" : "text-muted-foreground"
              }`}
            />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            updateDropdownPos();
          }}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isFocused ? "Search Anything..." : animatedPlaceholder}
          className="w-full bg-transparent py-3 pl-11 pr-28 text-base font-medium placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Voice Search Button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            className="absolute right-16 p-2 rounded-lg transition-all duration-300 hover:bg-muted text-muted-foreground hover:text-foreground"
            title={isListening ? "Stop listening" : "Start voice search"}
          >
            {isListening ? (
              <div className="w-4 h-4 flex items-center justify-center gap-0.5">
                <div
                  className="w-0.5 bg-red-500 rounded-full animate-sound-wave-1"
                  style={{ height: "10px" }}
                ></div>
                <div
                  className="w-0.5 bg-red-500 rounded-full animate-sound-wave-2"
                  style={{ height: "14px" }}
                ></div>
                <div
                  className="w-0.5 bg-red-500 rounded-full animate-sound-wave-3"
                  style={{ height: "8px" }}
                ></div>
              </div>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-4 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-foreground text-foreground hover:bg-foreground hover:text-background"
        >
          Search
        </button>
      </div>

      {/* Search Suggestions Dropdown (portal so it always stays above capsules) */}
      {showSuggestions &&
        dropdownPos &&
        createPortal(
          <div
            ref={suggestionsRef}
            className="fixed bg-background border border-border rounded-xl overflow-hidden shadow-xl z-[1000] animate-fade-in"
            style={{
              left: dropdownPos.left,
              top: dropdownPos.top,
              width: dropdownPos.width,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors duration-150 ${
                  index === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{suggestion}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </form>
  );
}
