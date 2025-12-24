import { ExternalLink, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultProps {
  title: string;
  link: string;
  snippet: string;
  index: number;
  platform?: string;
  onLike?: (url: string) => void;
  onDislike?: (url: string) => void;
  onAddToFavorites?: (url: string) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  isFavorite?: boolean;
}

const platformLogos: Record<string, string> = {
  vercel: "/logos/vercel.ico",
  github: "/logos/github.svg",
  netlify: "/logos/netlify.ico",
  railway: "/logos/railway.ico",
  onrender: "/logos/render.png",
  bubble: "/logos/bubble.png",
  framer: "/logos/framer.png",
  replit: "/logos/replit.png",
  bolt: "/logos/bolt.png",
  fly: "/logos/fly.svg",
  lovable: "/logos/lovable.ico",
};

function getPlatformFromUrl(url: string): string | null {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('vercel.app') || lowercaseUrl.includes('vercel.com')) return 'vercel';
  if (lowercaseUrl.includes('github.io') || lowercaseUrl.includes('github.com')) return 'github';
  if (lowercaseUrl.includes('netlify.app') || lowercaseUrl.includes('netlify.com')) return 'netlify';
  if (lowercaseUrl.includes('railway.app')) return 'railway';
  if (lowercaseUrl.includes('onrender.com') || lowercaseUrl.includes('render.com')) return 'onrender';
  if (lowercaseUrl.includes('bubble.io')) return 'bubble';
  if (lowercaseUrl.includes('framer.site') || lowercaseUrl.includes('framer.com')) return 'framer';
  if (lowercaseUrl.includes('replit.com') || lowercaseUrl.includes('repl.co')) return 'replit';
  if (lowercaseUrl.includes('bolt.new')) return 'bolt';
  if (lowercaseUrl.includes('fly.io') || lowercaseUrl.includes('fly.dev')) return 'fly';
  if (lowercaseUrl.includes('lovable.dev') || lowercaseUrl.includes('lovable.app')) return 'lovable';
  
  return null;
}

export function SearchResult({ 
  title, 
  link, 
  snippet, 
  index, 
  platform, 
  onLike, 
  onDislike, 
  onAddToFavorites,
  isLiked = false,
  isDisliked = false,
  isFavorite = false
}: SearchResultProps) {
  const displayUrl = link.replace(/^https?:\/\//, "").split("/")[0];
  const detectedPlatform = platform || getPlatformFromUrl(link);
  const logoUrl = detectedPlatform ? platformLogos[detectedPlatform] : null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block bg-card border border-border rounded-lg p-4 hover:border-primary/30 
        hover:shadow-sm transition-all duration-200 opacity-0 animate-slide-up
      `}
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start gap-3">
        {/* Favicon / Platform Logo */}
        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-muted flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={detectedPlatform || 'website'} 
              className="w-4 h-4 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-4 h-4 rounded bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/20 ${logoUrl ? 'hidden' : ''}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* URL */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground truncate">
              {displayUrl}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-base font-medium text-primary mb-1 line-clamp-1 group-hover:underline">
            {title}
          </h3>
          
          {/* Snippet */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {snippet}
          </p>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onLike?.(link);
              }}
              className={`h-7 px-2 text-xs ${isLiked ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : ''}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onDislike?.(link);
              }}
              className={`h-7 px-2 text-xs ${isDisliked ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : ''}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToFavorites?.(link);
              }}
              className={`h-7 px-2 text-xs ${isFavorite ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 mt-1" />
      </div>
    </a>
  );
}
