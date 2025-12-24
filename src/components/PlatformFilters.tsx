import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Layers } from "lucide-react";

export type Platform = "all" | "vercel" | "github" | "onrender" | "netlify" | "railway" | "bubble" | "framer" | "replit" | "bolt" | "fly" | "lovable";

interface PlatformFiltersProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
  variant?: "pills" | "dropdown";
}

// Platform configurations with logos and colors
const platformConfig: Record<Platform, { label: string; logo: string; color: string }> = {
  all: { label: "All", logo: "", color: "from-blue-500 to-purple-500" },
  vercel: { label: "Vercel", logo: "/logos/vercel.ico", color: "from-black to-gray-800" },
  github: { label: "GitHub", logo: "/logos/github.svg", color: "from-gray-700 to-gray-900" },
  netlify: { label: "Netlify", logo: "/logos/netlify.ico", color: "from-teal-400 to-teal-600" },
  railway: { label: "Railway", logo: "/logos/railway.ico", color: "from-purple-500 to-purple-700" },
  onrender: { label: "Render", logo: "/logos/render.png", color: "from-emerald-400 to-emerald-600" },
  bubble: { label: "Bubble", logo: "/logos/bubble.png", color: "from-blue-400 to-blue-600" },
  framer: { label: "Framer", logo: "/logos/framer.png", color: "from-pink-500 to-purple-500" },
  replit: { label: "Replit", logo: "/logos/replit.png", color: "from-orange-400 to-orange-600" },
  bolt: { label: "Bolt", logo: "/logos/bolt.ico", color: "from-yellow-400 to-yellow-600" },
  fly: { label: "Fly.io", logo: "/logos/fly.svg", color: "from-violet-500 to-violet-700" },
  lovable: { label: "Lovable", logo: "/logos/lovable.ico", color: "from-pink-500 to-rose-500" },
};

const filters: Platform[] = ["all", "vercel", "github", "netlify", "railway", "onrender", "bubble", "framer", "replit", "bolt", "fly", "lovable"];

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  const config = platformConfig[platform];
  
  if (platform === "all") {
    return <Layers className="w-4 h-4" style={{ width: size, height: size }} />;
  }
  
  return (
    <img 
      src={config.logo} 
      alt={config.label}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

export function PlatformFilters({ selected, onChange, variant = "pills" }: PlatformFiltersProps) {
  const selectedConfig = platformConfig[selected];

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 min-w-[140px] justify-between"
          >
            <div className="flex items-center gap-2">
              <PlatformIcon platform={selected} size={16} />
              <span>{selectedConfig.label}</span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl">
          {filters.map((platform) => {
            const config = platformConfig[platform];
            return (
              <DropdownMenuItem
                key={platform}
                onClick={() => {
                  analytics.track('platform_filter', { platform });
                  onChange(platform);
                }}
                className={cn(
                  "cursor-pointer flex items-center gap-3 py-2.5 px-3 transition-colors",
                  selected === platform && "bg-primary/10 text-primary font-medium"
                )}
              >
                <PlatformIcon platform={platform} size={18} />
                <span>{config.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap px-2">
      {filters.map((platform) => {
        const config = platformConfig[platform];
        const isSelected = selected === platform;
        
        return (
          <button
            key={platform}
            onClick={() => {
              analytics.track('platform_filter', { platform });
              onChange(platform);
            }}
            className={cn(
              "group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              "border hover:scale-[1.02] active:scale-[0.98]",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "bg-background/50 text-muted-foreground border-border/50 hover:bg-background hover:text-foreground hover:border-border"
            )}
          >
            <span className={cn(
              "flex items-center justify-center w-5 h-5 rounded transition-transform",
              isSelected ? "scale-110" : "group-hover:scale-105"
            )}>
              <PlatformIcon platform={platform} size={16} />
            </span>
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
