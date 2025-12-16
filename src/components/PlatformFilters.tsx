import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export type Platform = "all" | "vercel" | "github" | "onrender" | "netlify" | "railway" | "bubble" | "framer" | "replit" | "bolt" | "fly" | "lovable";

interface PlatformFiltersProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
}

const filters: { id: Platform; label: string }[] = [
  { id: "all", label: "All" },
  { id: "vercel", label: "Vercel" },
  { id: "github", label: "GitHub" },
  { id: "netlify", label: "Netlify" },
  { id: "railway", label: "Railway" },
  { id: "onrender", label: "OnRender" },
  { id: "bubble", label: "Bubble" },
  { id: "framer", label: "Framer" },
  { id: "replit", label: "Replit" },
  { id: "bolt", label: "Bolt" },
  { id: "fly", label: "Fly.io" },
  { id: "lovable", label: "Lovable" },
];

export function PlatformFilters({ selected, onChange }: PlatformFiltersProps) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => {
            // Track platform filter usage
            analytics.track('platform_filter', { platform: filter.id });
            onChange(filter.id);
          }}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            "border border-border hover:border-foreground/30",
            selected === filter.id
              ? "glass-liquid-button bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
              : "glass-liquid bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
