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
            ? "glass-liquid-button bg-blue-600 text-white shadow-sm dark:bg-blue-500"
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
            ? "glass-liquid-button bg-blue-600 text-white shadow-sm dark:bg-blue-500"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Google CSE
      </button>
    </div>
  );
}