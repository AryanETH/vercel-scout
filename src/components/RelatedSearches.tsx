import { Search } from "lucide-react";

interface RelatedSearchesProps {
  query: string;
  onSearch: (query: string, isSuggestion?: boolean) => void;
}

// Generate related searches based on the query
function generateRelatedSearches(query: string): string[] {
  const queryLower = query.toLowerCase().trim();
  
  // Common related terms by category
  const relatedTerms: Record<string, string[]> = {
    games: ["free browser games", "puzzle games online", "multiplayer games", "arcade games", "word games", "strategy games", "indie games", "retro games"],
    tools: ["free online tools", "developer tools", "productivity tools", "design tools", "AI tools", "automation tools", "web tools", "utilities"],
    design: ["UI design tools", "graphic design", "logo maker", "color palette", "icon packs", "design resources", "mockup tools", "prototyping"],
    code: ["code snippets", "programming tutorials", "open source projects", "developer resources", "code editors", "API documentation", "coding challenges", "frameworks"],
    ai: ["AI tools free", "chatbot builders", "AI image generator", "machine learning", "AI writing tools", "automation AI", "AI assistants", "neural networks"],
    music: ["free music player", "audio tools", "podcast hosting", "sound effects", "music creation", "streaming apps", "audio editor", "music discovery"],
    video: ["video editor free", "screen recorder", "video hosting", "animation tools", "video converter", "streaming platforms", "video effects", "media player"],
    productivity: ["task manager", "note taking apps", "calendar tools", "time tracking", "project management", "collaboration tools", "workflow automation", "goal tracker"],
    learning: ["online courses free", "tutorials", "coding bootcamp", "language learning", "skill development", "educational resources", "study tools", "certifications"],
    hosting: ["free web hosting", "static site hosting", "cloud platforms", "domain services", "CDN providers", "serverless hosting", "deployment tools", "VPS hosting"],
  };

  // Find matching category
  for (const [category, terms] of Object.entries(relatedTerms)) {
    if (queryLower.includes(category) || category.includes(queryLower)) {
      return terms;
    }
  }

  // Default suggestions based on common patterns
  const defaultSuggestions = [
    `${query} free`,
    `${query} online`,
    `best ${query}`,
    `${query} tools`,
    `${query} alternatives`,
    `open source ${query}`,
    `${query} for beginners`,
    `${query} resources`,
  ];

  return defaultSuggestions;
}

export function RelatedSearches({ query, onSearch }: RelatedSearchesProps) {
  const suggestions = generateRelatedSearches(query).slice(0, 8);

  if (!query) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">You might like</h3>
      <div className="grid grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSearch(suggestion, true)}
            className="flex items-center gap-2 px-4 py-3 bg-muted/50 hover:bg-muted rounded-md text-left transition-colors group"
          >
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            <span className="text-sm text-foreground truncate">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
