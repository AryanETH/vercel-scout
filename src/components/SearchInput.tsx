import { Search, Loader2, Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { useAnimatedPlaceholder } from "@/hooks/useAnimatedPlaceholder";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { analytics } from "@/lib/analytics";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch();
  const animatedPlaceholder = useAnimatedPlaceholder();
  const { suggestions } = useSearchSuggestions(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  // Show suggestions when we have them and input is focused
  useEffect(() => {
    setShowSuggestions(isFocused && suggestions.length > 0 && query.length >= 2);
    setSelectedIndex(-1);
  }, [suggestions, isFocused, query]);

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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      analytics.track('search', { query: query.trim() });
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    analytics.track('search', { query: suggestion });
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      analytics.track('voice_search', {});
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
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
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={isFocused ? "Search Anything..." : animatedPlaceholder}
          className="w-full bg-transparent py-5 pl-14 pr-36 text-lg font-medium placeholder:text-muted-foreground focus:outline-none"
        />
        
        {/* Voice Search Button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            className="absolute right-20 p-2 rounded-lg transition-all duration-300 hover:bg-muted text-muted-foreground hover:text-foreground"
            title={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? (
              <div className="w-5 h-5 flex items-center justify-center gap-0.5">
                <div className="w-0.5 bg-red-500 rounded-full animate-sound-wave-1" style={{height: '12px'}}></div>
                <div className="w-0.5 bg-red-500 rounded-full animate-sound-wave-2" style={{height: '16px'}}></div>
                <div className="w-0.5 bg-red-500 rounded-full animate-sound-wave-3" style={{height: '10px'}}></div>
              </div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-3 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-foreground text-foreground hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
        >
          Search
        </button>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden shadow-lg z-50 animate-fade-in"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-5 py-3 text-left flex items-center gap-3 transition-colors duration-150 ${
                index === selectedIndex 
                  ? 'bg-muted/80' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in stagger-2">
        F*CK SEO • FIND SITES & FREE TOOL
      </p>
    </form>
  );
}
