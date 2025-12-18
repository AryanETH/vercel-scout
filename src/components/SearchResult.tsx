import { ExternalLink, Globe, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { getAutoTag } from "@/lib/autoTagger";
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
  const autoTag = getAutoTag(link);
  
  const getPlatformColor = (platform?: string) => {
    const colors: Record<string, string> = {
      vercel: "bg-black text-white",
      github: "bg-gray-800 text-white",
      netlify: "bg-teal-500 text-white",
      railway: "bg-purple-600 text-white",
      onrender: "bg-green-600 text-white",
      bubble: "bg-blue-500 text-white",
      framer: "bg-pink-500 text-white",
      replit: "bg-orange-500 text-white",
      bolt: "bg-yellow-500 text-black",
      fly: "bg-indigo-600 text-white",
      lovable: "bg-red-500 text-white",
    };
    return colors[platform || ""] || "bg-secondary text-muted-foreground";
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block glass rounded-2xl p-6 hover-lift opacity-0 animate-slide-up
        hover:bg-accent/50 transition-colors duration-300
      `}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground truncate">
              {displayUrl}
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${autoTag.color}`}>
              {autoTag.emoji} {autoTag.label}
            </span>
            {platform && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(platform)}`}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold mb-2 line-clamp-2 group-hover:text-foreground transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {snippet}
          </p>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onLike?.(link);
              }}
              className={`h-8 px-2 ${isLiked ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : ''}`}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onDislike?.(link);
              }}
              className={`h-8 px-2 ${isDisliked ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : ''}`}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToFavorites?.(link);
              }}
              className={`h-8 px-2 ${isFavorite ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0" />
      </div>
    </a>
  );
}
