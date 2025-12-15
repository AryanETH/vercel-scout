import { cn } from "@/lib/utils";

interface SearchModeToggleProps {
  mode: "custom" | "google";
  onChange: (mode: "custom" | "google") => void;
}

export function SearchModeToggle({ mode, onChange }: SearchModeToggleProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-secondary rounded-lg">
      <button
        onClick={() => onChange("custom")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          mode === "custom"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Custom Search
      </button>
      <button
        onClick={() => onChange("google")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          mode === "google"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Google CSE
      </button>
    </div>
  );
}