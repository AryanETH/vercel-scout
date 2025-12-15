import { Search } from "lucide-react";
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
          No results found
        </h3>
        <p className="text-muted-foreground max-w-md">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <TopPicks />
    </div>
  );
}
