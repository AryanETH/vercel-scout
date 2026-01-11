import { Keyboard, Command, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ShortcutHintProps {
  onShowShortcuts: () => void;
  onOpenCommandPalette?: () => void;
}

export function ShortcutHint({ onShowShortcuts, onOpenCommandPalette }: ShortcutHintProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('shortcutHintDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('shortcutHintDismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
      <button
        onClick={onShowShortcuts}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs text-muted-foreground hover:bg-background/90 hover:text-foreground transition-colors group"
      >
        <Keyboard className="w-3 h-3 group-hover:text-primary transition-colors" />
        <span>Press</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted border border-border rounded">?</kbd>
        <span>for shortcuts</span>
      </button>
      {onOpenCommandPalette && (
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs text-muted-foreground hover:bg-background/90 hover:text-foreground transition-colors group"
        >
          <Command className="w-3 h-3 group-hover:text-primary transition-colors" />
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted border border-border rounded">⌘K</kbd>
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="flex items-center justify-center w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
        aria-label="Dismiss shortcut hints"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
