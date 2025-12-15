import { cn } from "@/lib/utils";

export type Platform = "all" | "vercel" | "github" | "onrender";

interface PlatformFiltersProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
}

const filters: { id: Platform; label: string }[] = [
  { id: "all", label: "All" },
  { id: "vercel", label: "Vercel" },
  { id: "github", label: "GitHub" },
  { id: "onrender", label: "OnRender" },
];

export function PlatformFilters({ selected, onChange }: PlatformFiltersProps) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            "border border-border hover:border-foreground/30",
            selected === filter.id
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
