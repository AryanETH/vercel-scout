import { Search, Heart } from "lucide-react";
import { TopPicks } from "./TopPicks";

interface EmptyStateProps {
  hasSearched: boolean;
}

export function EmptyState({ hasSearched }: EmptyStateProps) {
  if (hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold mb-2">
          Support This Project
        </h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Currently Out of Search Quota Limit
        </p>
        
        <a
          href="https://ko-fi.com/yourel"
          target="_blank"
          rel="noopener noreferrer"
          className="glass px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
        >
          <Heart className="w-5 h-5" />
          Support Us
        </a>
      </div>
    );
  }

  return (
    <div className="py-8">
      <TopPicks />
    </div>
  );
}
