import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BackgroundContextType {
  showBackgrounds: boolean;
  setShowBackgrounds: (show: boolean) => void;
}

const BackgroundContext = createContext<BackgroundContextType>({
  showBackgrounds: true,
  setShowBackgrounds: () => {}
});

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [showBackgrounds, setShowBackgrounds] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yourel-show-backgrounds');
    if (saved !== null) {
      setShowBackgrounds(saved === 'true');
    }
  }, []);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setShowBackgrounds(event.detail.showBackgrounds);
    };

    window.addEventListener('background-settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('background-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  return (
    <BackgroundContext.Provider value={{ showBackgrounds, setShowBackgrounds }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  return useContext(BackgroundContext);
}