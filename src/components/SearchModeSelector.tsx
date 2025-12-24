import { cn } from "@/lib/utils";

export type SearchMode = "general" | "favorites";

interface SearchModeSelectorProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

export function SearchModeSelector({ mode, onChange }: SearchModeSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange("general")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-all duration-200 border-b-2",
          mode === "general"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        General
      </button>
      <button
        onClick={() => onChange("favorites")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-all duration-200 border-b-2",
          mode === "favorites"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        User Favorites
      </button>
    </div>
  );
}