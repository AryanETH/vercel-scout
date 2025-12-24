import { cn } from "@/lib/utils";
import { Globe, Heart, Video, Image, Newspaper } from "lucide-react";

export type SearchMode = "general" | "favorites";

type FilterTab = "all" | "videos" | "images" | "news";

interface SearchModeSelectorProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
  activeFilter?: FilterTab;
  onFilterChange?: (filter: FilterTab) => void;
}

const tabs = [
  { id: "general" as const, label: "General", icon: Globe, isMode: true },
  { id: "favorites" as const, label: "Favorites", icon: Heart, isMode: true },
  { id: "all" as const, label: "All", isMode: false },
  { id: "videos" as const, label: "Videos", icon: Video, isMode: false },
  { id: "images" as const, label: "Images", icon: Image, isMode: false },
  { id: "news" as const, label: "News", icon: Newspaper, isMode: false },
];

export function SearchModeSelector({ 
  mode, 
  onChange, 
  activeFilter = "all",
  onFilterChange 
}: SearchModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.isMode 
          ? mode === tab.id 
          : activeFilter === tab.id;
        
        const handleClick = () => {
          if (tab.isMode) {
            onChange(tab.id as SearchMode);
          } else {
            onFilterChange?.(tab.id as FilterTab);
          }
        };

        // Skip filter tabs if no handler provided (backwards compatibility)
        if (!tab.isMode && !onFilterChange) return null;

        return (
          <button
            key={tab.id}
            onClick={handleClick}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 md:border-b-[3px]",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
