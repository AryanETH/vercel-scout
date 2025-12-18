import { Search, Loader2, Mic, MicOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { useAnimatedPlaceholder } from "@/hooks/useAnimatedPlaceholder";
import { analytics } from "@/lib/analytics";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch();
  const animatedPlaceholder = useAnimatedPlaceholder();

  // Update query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Track search analytics
      analytics.track('search', { query: query.trim() });
      onSearch(query.trim());
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      // Track voice search usage
      analytics.track('voice_search', {});
      startListening();
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
          placeholder={isFocused ? "Search Anything..." : animatedPlaceholder}
          className="w-full bg-transparent py-5 pl-14 pr-36 text-lg font-medium placeholder:text-muted-foreground focus:outline-none"
        />
        
        {/* Voice Search Button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            className="absolute right-20 p-9 rounded-lg transition-all duration-300 hover:bg- text-muted-foreground hover:text-foreground"
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
      <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in stagger-2">
        F*CK SEO • FIND SITES & FREE TOOL
      </p>
    </form>
  );
}
