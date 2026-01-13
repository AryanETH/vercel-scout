import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Ad, adStorage } from '@/lib/adStorage';

interface AdResultProps {
  ad: Ad;
}

export function AdResult({ ad }: AdResultProps) {
  // Record impression when ad is displayed
  useEffect(() => {
    adStorage.recordImpression(ad.id);
  }, [ad.id]);

  const handleClick = () => {
    adStorage.recordClick(ad.id);
    window.open(ad.link, '_blank', 'noopener,noreferrer');
  };

  const faviconUrl = adStorage.getFaviconUrl(ad.link);

  return (
    <div className="mb-4 animate-fade-in">
      <div 
        onClick={handleClick}
        className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer"
      >
        {/* Ad Label */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Sponsored
          </span>
        </div>

        {/* Main Content */}
        <div className="flex gap-4">
          {/* Ad Image (if provided) */}
          {ad.imageUrl && (
            <div className="hidden sm:block flex-shrink-0">
              <img 
                src={ad.imageUrl} 
                alt={ad.title}
                className="w-24 h-24 object-cover rounded-lg border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* URL with favicon */}
            <div className="flex items-center gap-2 mb-1">
              {faviconUrl && (
                <img 
                  src={faviconUrl} 
                  alt="" 
                  className="w-4 h-4 rounded-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-xs text-muted-foreground truncate">
                {ad.displayUrl}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-medium text-primary group-hover:underline mb-1 line-clamp-1">
              {ad.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ad.description}
            </p>
          </div>

          {/* External link icon */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
