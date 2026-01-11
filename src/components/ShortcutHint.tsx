import { Keyboard, Command } from "lucide-react";

interface ShortcutHintProps {
  onShowShortcuts: () => void;
  onOpenCommandPalette?: () => void;
}

export function ShortcutHint({ onShowShortcuts, onOpenCommandPalette }: ShortcutHintProps) {
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
    </div>
  );
}
