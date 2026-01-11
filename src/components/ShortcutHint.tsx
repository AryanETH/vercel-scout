import { Keyboard } from "lucide-react";

interface ShortcutHintProps {
  onShowShortcuts: () => void;
}

export function ShortcutHint({ onShowShortcuts }: ShortcutHintProps) {
  return (
    <button
      onClick={onShowShortcuts}
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs text-muted-foreground hover:bg-background/90 hover:text-foreground transition-colors group"
    >
      <Keyboard className="w-3 h-3 group-hover:text-primary transition-colors" />
      <span>Press</span>
      <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted border border-border rounded">?</kbd>
      <span>for shortcuts</span>
    </button>
  );
}
