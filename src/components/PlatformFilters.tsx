import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe, Github, Layers } from "lucide-react";

export type Platform = "all" | "vercel" | "github" | "onrender" | "netlify" | "railway" | "bubble" | "framer" | "replit" | "bolt" | "fly" | "lovable";

interface PlatformFiltersProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
  variant?: "pills" | "dropdown";
}

// Platform configurations with logos and colors
const platformConfig: Record<Platform, { label: string; logo: string; color: string }> = {
  all: { label: "All", logo: "", color: "from-blue-500 to-purple-500" },
  vercel: { label: "Vercel", logo: "https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico", color: "from-black to-gray-800" },
  github: { label: "GitHub", logo: "", color: "from-gray-700 to-gray-900" },
  netlify: { label: "Netlify", logo: "https://www.netlify.com/v3/static/favicon/favicon-32x32.png", color: "from-teal-400 to-teal-600" },
  railway: { label: "Railway", logo: "https://railway.app/brand/logo-light.png", color: "from-purple-500 to-purple-700" },
  onrender: { label: "Render", logo: "https://cdn.sanity.io/images/hvk0tap5/production/ff4fc453d0b34c7dd89be962ef338a9e95c7bda0-128x128.png", color: "from-emerald-400 to-emerald-600" },
  bubble: { label: "Bubble", logo: "https://d1muf25xaso8hp.cloudfront.net/https://s3.amazonaws.com/appforest_uf/f1543945091498x976498034498498800/Bubble-Logo-2022-Square.png?w=64&h=64&auto=compress&fit=crop", color: "from-blue-400 to-blue-600" },
  framer: { label: "Framer", logo: "https://framerusercontent.com/images/3vyTpx6PRhS2G1WGJvYPZ0qsA.png", color: "from-pink-500 to-purple-500" },
  replit: { label: "Replit", logo: "https://replit.com/cdn-cgi/image/width=64,quality=80,format=auto/https://storage.googleapis.com/replit/images/1664475603315_1442b249a51ed0adb68dd8e3bb09c886.png", color: "from-orange-400 to-orange-600" },
  bolt: { label: "Bolt", logo: "https://bolt.new/social_preview_index.jpg", color: "from-yellow-400 to-yellow-600" },
  fly: { label: "Fly.io", logo: "https://fly.io/static/images/brand/logo-portrait.svg", color: "from-violet-500 to-violet-700" },
  lovable: { label: "Lovable", logo: "https://lovable.dev/favicon.ico", color: "from-pink-500 to-rose-500" },
};

const filters: Platform[] = ["all", "vercel", "github", "netlify", "railway", "onrender", "bubble", "framer", "replit", "bolt", "fly", "lovable"];

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  const config = platformConfig[platform];
  
  if (platform === "all") {
    return <Layers className="w-4 h-4" style={{ width: size, height: size }} />;
  }
  
  if (platform === "github") {
    return <Github className="w-4 h-4" style={{ width: size, height: size }} />;
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
