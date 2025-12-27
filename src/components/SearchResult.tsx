import { ExternalLink, ThumbsUp, ThumbsDown, Heart, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback } from "react";

interface SearchResultProps {
  title: string;
  link: string;
  snippet: string;
  index: number;
  platform?: string;
  onLike?: (url: string) => void;
  onDislike?: (url: string) => void;
  onAddToFavorites?: (url: string, name: string) => void;
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

const platformGradients: Record<string, string> = {
  vercel: "from-gray-900 to-gray-700",
  github: "from-gray-800 to-gray-600",
  netlify: "from-teal-500 to-teal-700",
  railway: "from-purple-600 to-purple-800",
  onrender: "from-emerald-500 to-emerald-700",
  bubble: "from-blue-500 to-blue-700",
  framer: "from-pink-500 to-purple-600",
  replit: "from-orange-500 to-orange-700",
  bolt: "from-yellow-500 to-yellow-700",
  fly: "from-violet-600 to-violet-800",
  lovable: "from-pink-500 to-rose-600",
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

function getScreenshotUrl(url: string): string {
  // Use WordPress mShots (returns an image directly)
  const encodedUrl = encodeURIComponent(url);
  return `https://s.wordpress.com/mshots/v1/${encodedUrl}?w=900`;
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
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  
  const displayUrl = link.replace(/^https?:\/\//, "").split("/")[0];
  const detectedPlatform = platform || getPlatformFromUrl(link);
  const logoUrl = detectedPlatform ? platformLogos[detectedPlatform] : null;
  const gradient = detectedPlatform ? platformGradients[detectedPlatform] : "from-gray-600 to-gray-800";
  
  // Generate screenshot URL
  const screenshotUrl = getScreenshotUrl(link);

  // Long press handlers for mobile
  const handleTouchStart = useCallback(() => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setShowMobileActions(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    // Prevent navigation if it was a long press
    if (isLongPressRef.current) {
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  }, []);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block hover:bg-muted/30
        transition-all duration-300 opacity-0 animate-slide-up
      `}
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
    >
      {/* Mobile: Google-style vertical stack */}
      <div 
        className="md:hidden py-4 border-b border-border/50 relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {/* Site info row - favicon + domain + URL */}
        <div className="flex items-center gap-2.5 mb-2">
          {/* Favicon container - rounded circle like Google */}
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {detectedPlatform && logoUrl ? (
              <img 
                src={logoUrl} 
                alt={detectedPlatform} 
                className="w-4 h-4 object-contain"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                {displayUrl.charAt(0)}
              </span>
            )}
          </div>
          
          {/* Domain info - stacked like Google */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm text-foreground truncate leading-tight">
              {displayUrl.split('.')[0]}
            </span>
            <span className="text-xs text-muted-foreground truncate leading-tight">
              {link.replace(/^https?:\/\//, '').split('?')[0]}
            </span>
          </div>

          {/* Mobile action buttons - shown on long press */}
          {showMobileActions && (
            <div className="flex items-center gap-1 animate-fade-in">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToFavorites?.(link, title);
                  setShowMobileActions(false);
                }}
                className={`h-8 w-8 p-0 ${isFavorite ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' : 'text-muted-foreground'}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMobileActions(false);
                }}
                className="h-8 w-8 p-0 text-muted-foreground"
              >
                ✕
              </Button>
            </div>
          )}
        </div>
        
        {/* Title - blue link like Google */}
        <h3 className="text-lg text-[#8ab4f8] dark:text-[#8ab4f8] font-normal leading-snug mb-1 line-clamp-2 group-hover:underline">
          {title}
        </h3>
        
        {/* Snippet - gray text */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {snippet}
        </p>
        
        {/* Long press hint */}
        {!showMobileActions && (
          <p className="text-[10px] text-muted-foreground/50 mt-1">Long press to favorite</p>
        )}
      </div>

      {/* Desktop: With preview image */}
      <div className="hidden md:flex">
        {/* Content - Left Side */}
        <div className="flex-1 p-4 min-w-0">
          {/* Platform badge + URL */}
          <div className="flex items-center gap-2 mb-2">
            {detectedPlatform && logoUrl && (
              <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-0.5">
                <img 
                  src={logoUrl} 
                  alt={detectedPlatform} 
                  className="w-3.5 h-3.5 object-contain"
                />
                <span className="text-xs font-medium text-muted-foreground capitalize">{detectedPlatform}</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">
              {displayUrl}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-base font-medium text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {/* Snippet */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {snippet}
          </p>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onLike?.(link);
              }}
              className={`h-7 px-2 text-xs ${isLiked ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'opacity-0 group-hover:opacity-100'}`}
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
              className={`h-7 px-2 text-xs ${isDisliked ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToFavorites?.(link, title);
              }}
              className={`h-7 px-2 text-xs ${isFavorite ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 ml-auto" />
          </div>
        </div>
        
        {/* Website Preview Image - Right Side (Desktop only) */}
        <div className="relative w-48 flex-shrink-0 overflow-hidden bg-muted rounded-md">
          {!imageError ? (
            <>
              {imageLoading && (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} animate-pulse`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {logoUrl && (
                      <img 
                        src={logoUrl} 
                        alt={detectedPlatform || 'platform'} 
                        className="w-10 h-10 object-contain opacity-30"
                      />
                    )}
                  </div>
                </div>
              )}
              <img 
                src={screenshotUrl}
                alt={`Preview of ${title}`}
                className={`w-full h-full object-cover object-top transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={detectedPlatform || 'platform'} 
                  className="w-12 h-12 object-contain opacity-50"
                />
              ) : (
                <ImageOff className="w-6 h-6 text-white/30" />
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
