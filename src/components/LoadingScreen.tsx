import { useEffect, useState } from "react";
import { AnimatedGrid } from "./AnimatedGrid";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <AnimatedGrid />
      <div className="text-center space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 animate-pulse">
          <div 
            className="relative flex items-center justify-center"
            style={{ width: "120px", height: "90px" }}
          >
            <img
              src="/yourel-logo.png"
              alt="Yourel Logo"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
              style={{ imageRendering: 'crisp-edges' }}
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl flex items-center justify-center';
                fallback.innerHTML = `
                  <svg width="60" height="45" viewBox="0 0 60 45" fill="none" class="text-white">
                    <path d="M10 10L30 30L50 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                `;
                target.parentNode?.appendChild(fallback);
              }}
            />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              YOUREL
            </h1>
            <p className="text-lg text-muted-foreground -mt-1">
              Discover The Undiscovered
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading... {progress}%
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}