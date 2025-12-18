import { cn } from "@/lib/utils";

export type SearchMode = "general" | "favorites";

interface SearchModeSelectorProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

export function SearchModeSelector({ mode, onChange }: SearchModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-secondary rounded-lg">
      <button
        onClick={() => onChange("general")}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          mode === "general"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        General
      </button>
      <button
        onClick={() => onChange("favorites")}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          mode === "favorites"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        User Favorites
      </button>
    </div>
  );
}