import { useEffect, useRef } from 'react';

interface GoogleCSEFallbackProps {
  onClose?: () => void;
}

export function GoogleCSEFallback({ onClose }: GoogleCSEFallbackProps) {
  const cseRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only load the script once
    if (scriptLoadedRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cse.google.com/cse.js?cx=d0fda404aaab344d5';
    script.async = true;
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      // The CSE will automatically render in the div with class "gcse-search"
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Search Powered by Google
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Discover Amazing Projects
        </h2>
        <p className="text-muted-foreground text-lg mb-6">
          Search across all platforms to find portfolios, tools, and creative projects
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-full border border-border hover:border-foreground/20 mb-6"
          >
            ← Back to Top Picks
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-2xl p-8 border border-border/50">
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold mb-2">Search Tips:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>• Try "portfolio site:vercel.app"</div>
              <div>• Search "dashboard site:netlify.app"</div>
              <div>• Find "saas site:railway.app"</div>
              <div>• Discover "blog site:github.io"</div>
            </div>
          </div>
          
          {/* Google Custom Search Element */}
          <div ref={cseRef} className="gcse-search-container">
            <div className="gcse-search" data-enableAutoComplete="true"></div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⚛️</div>
            <div className="text-xs font-medium">Vercel</div>
            <div className="text-xs text-muted-foreground">Frontend Apps</div>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💻</div>
            <div className="text-xs font-medium">GitHub</div>
            <div className="text-xs text-muted-foreground">Open Source</div>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-xs font-medium">Railway</div>
            <div className="text-xs text-muted-foreground">Full Stack</div>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <div className="text-xs font-medium">Netlify</div>
            <div className="text-xs text-muted-foreground">JAMstack</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gcse-search-container {
          /* Custom styling for Google CSE */
        }
        
        /* Override Google CSE default styles to match our theme */
        :global(.gsc-control-cse) {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        
        :global(.gsc-search-box) {
          margin-bottom: 1rem !important;
        }
        
        :global(.gsc-input-box) {
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.5rem !important;
          background-color: hsl(var(--background)) !important;
        }
        
        :global(.gsc-input) {
          background-color: transparent !important;
          color: hsl(var(--foreground)) !important;
          font-family: inherit !important;
        }
        
        :global(.gsc-search-button) {
          background-color: hsl(var(--primary)) !important;
          border: none !important;
          border-radius: 0.375rem !important;
        }
        
        :global(.gsc-results) {
          background-color: transparent !important;
        }
        
        :global(.gsc-webResult) {
          background-color: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.75rem !important;
          margin-bottom: 1rem !important;
          padding: 1rem !important;
        }
        
        :global(.gs-title a) {
          color: hsl(var(--foreground)) !important;
          text-decoration: none !important;
        }
        
        :global(.gs-title a:hover) {
          color: hsl(var(--primary)) !important;
        }
        
        :global(.gs-snippet) {
          color: hsl(var(--muted-foreground)) !important;
        }
        
        :global(.gs-visibleUrl) {
          color: hsl(var(--muted-foreground)) !important;
        }
      `}</style>
    </div>
  );
}