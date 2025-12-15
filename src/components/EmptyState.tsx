import { Search } from "lucide-react";

interface EmptyStateProps {
  hasSearched: boolean;
}

export function EmptyState({ hasSearched }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">
        {hasSearched ? "No results found" : "Start your search"}
      </h3>
      <p className="text-muted-foreground max-w-md">
        {hasSearched
          ? "Try different keywords or check your spelling"
          : "Discover amazing projects hosted on Vercel. Search for portfolios, dashboards, tools, and more."}
      </p>
    </div>
  );
}
