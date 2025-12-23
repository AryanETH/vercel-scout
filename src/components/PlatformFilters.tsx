import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter } from "lucide-react";

export type Platform = "all" | "vercel" | "github" | "onrender" | "netlify" | "railway" | "bubble" | "framer" | "replit" | "bolt" | "fly" | "lovable";

interface PlatformFiltersProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
  variant?: "pills" | "dropdown";
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

export function PlatformFilters({ selected, onChange, variant = "pills" }: PlatformFiltersProps) {
  const selectedLabel = filters.find(f => f.id === selected)?.label || "All";

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            {selectedLabel}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
          {filters.map((filter) => (
            <DropdownMenuItem
              key={filter.id}
              onClick={() => {
                analytics.track('platform_filter', { platform: filter.id });
                onChange(filter.id);
              }}
              className={cn(
                "cursor-pointer",
                selected === filter.id && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {filter.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => {
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
