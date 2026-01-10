import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { useUnsplashDaily } from "@/hooks/useUnsplashDaily";

// Hook to detect if device is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

interface DynamicBackgroundProps {
  hasSearched?: boolean;
}

export function DynamicBackground({ hasSearched = false }: DynamicBackgroundProps) {
  const [showBackgrounds, setShowBackgrounds] = useState(true);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [scrollBlur, setScrollBlur] = useState(0);
  const isMobile = useIsMobile();
  const { dailyImage, isLoading: unsplashLoading } = useUnsplashDaily();

  // Load settings from localStorage
  useEffect(() => {
    const savedShowBg = localStorage.getItem('yourel-show-backgrounds');
    const savedSelectedBg = localStorage.getItem('yourel-selected-background');
    
    console.log('Loading background settings:', { savedShowBg, savedSelectedBg: savedSelectedBg?.substring(0, 50) });
    
    if (savedShowBg !== null) setShowBackgrounds(savedShowBg === 'true');
    if (savedSelectedBg) setCustomBackground(savedSelectedBg);
  }, []);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      console.log('Background settings changed:', event.detail);
      setShowBackgrounds(event.detail.showBackgrounds);
      setCustomBackground(event.detail.selectedBackground);
    };

    window.addEventListener('background-settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('background-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  // Track scroll for blur effect - 0 blur at top, up to 70% blur at bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate blur based on scroll position (0 at top, 0.7 at bottom)
      const scrollPercent = documentHeight > 0 ? scrollY / documentHeight : 0;
      const blurAmount = scrollPercent * 0.7; // Max 70% blur
      setScrollBlur(blurAmount);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render if backgrounds are disabled OR if on mobile (mobile uses comet animation)
  // Also don't render on search results page - use normal theme background
  if (!showBackgrounds || isMobile || hasSearched) return null;

  const isCustom = !!customBackground;
  // Use custom background if set, otherwise use Unsplash daily image
  const backgroundUrl = customBackground || dailyImage?.url;
  const photographerName = dailyImage?.photographer || 'Unsplash';

  // Show nothing while loading Unsplash image (if no custom background)
  if (!isCustom && !backgroundUrl && unsplashLoading) return null;

  return (
    <>
      {/* Background Image */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {backgroundUrl && (
          <img
            src={backgroundUrl}
            alt={dailyImage?.alt || "Background"}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: `blur(${scrollBlur * 20}px)`,
              transition: 'filter 0.1s ease-out'
            }}
            onError={(e) => console.error('Image failed to load:', backgroundUrl?.substring(0, 100))}
            onLoad={() => console.log('Image loaded successfully')}
          />
        )}
      </div>

      {/* Image Credit - show Unsplash photographer for daily image */}
      {!isCustom && dailyImage && (
        <div className="fixed bottom-4 right-4 pointer-events-auto z-50">
          <a 
            href={dailyImage.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs text-muted-foreground hover:bg-background/90 transition-colors"
          >
            <Camera className="w-3 h-3" />
            <span>
              Photo by <span className="font-medium">{photographerName}</span>
            </span>
            <span className="opacity-50">•</span>
            <span className="opacity-70">Unsplash</span>
          </a>
        </div>
      )}
    </>
  );
}