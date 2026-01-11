import { useEffect, useCallback, useState } from 'react';
import { Platform } from '@/components/PlatformFilters';
import { toast } from 'sonner';

interface ShortcutHandlers {
  onFocusSearch?: () => void;
  onClearSearch?: () => void;
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
  onOpenBundles?: () => void;
  onCreateBundle?: () => void;
  onShowShortcuts?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenAIAgent?: () => void;
  onPlatformChange?: (platform: Platform) => void;
  onNavigateResults?: (direction: 'up' | 'down') => void;
  onSelectResult?: () => void;
  onOpenInNewTab?: () => void;
  onCopyLink?: () => void;
  onCopyDomain?: () => void;
  onShareSearch?: () => void;
  onAddToBundle?: () => void;
  onShowFavorites?: () => void;
  selectedResult?: { title: string; link: string } | null;
  currentQuery?: string;
}

// Platform shortcuts mapping
const PLATFORM_NUMBER_SHORTCUTS: Record<string, Platform> = {
  '1': 'all',
  '2': 'vercel',
  '3': 'github',
  '4': 'netlify',
  '5': 'railway',
  '6': 'onrender',
  '7': 'bubble',
  '8': 'framer',
  '9': 'replit',
  '0': 'bolt',
};

const PLATFORM_LETTER_SHORTCUTS: Record<string, Platform> = {
  'v': 'vercel',
  'g': 'github',
  'n': 'netlify',
  'r': 'railway',
  'b': 'bubble',
  'f': 'framer',
  'l': 'lovable',
  'e': 'emergent',
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  const [isTyping, setIsTyping] = useState(false);

  // Track if user is typing in an input
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable;
      setIsTyping(isInput);
    };

    const handleBlur = () => {
      setIsTyping(false);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    const key = e.key.toLowerCase();

    // Always allow these shortcuts even when typing
    if (key === 'escape') {
      e.preventDefault();
      handlers.onClearSearch?.();
      return;
    }

    // Focus search with / (only when not typing)
    if (key === '/' && !isTyping && !cmdOrCtrl) {
      e.preventDefault();
      handlers.onFocusSearch?.();
      return;
    }

    // Show shortcuts with ? (only when not typing)
    if (key === '?' && !isTyping && !cmdOrCtrl) {
      e.preventDefault();
      handlers.onShowShortcuts?.();
      return;
    }

    // Alt shortcuts (AI Agent)
    if (e.altKey && !cmdOrCtrl) {
      if (key === 'a') {
        e.preventDefault();
        handlers.onOpenAIAgent?.();
        return;
      }
    }

    // Cmd/Ctrl shortcuts (work even when typing)
    if (cmdOrCtrl) {
      switch (key) {
        case 'k':
          e.preventDefault();
          handlers.onOpenCommandPalette?.();
          break;
        case 't':
          if (!e.shiftKey) {
            e.preventDefault();
            handlers.onToggleTheme?.();
          }
          break;
        case ',':
          e.preventDefault();
          handlers.onOpenSettings?.();
          break;
        case 'b':
          e.preventDefault();
          if (e.shiftKey) {
            handlers.onCreateBundle?.();
          } else {
            handlers.onOpenBundles?.();
          }
          break;
        case '/':
          e.preventDefault();
          handlers.onShowShortcuts?.();
          break;
        case 'l':
          e.preventDefault();
          if (e.shiftKey) {
            // Copy domain only
            if (handlers.selectedResult) {
              try {
                const domain = new URL(handlers.selectedResult.link).hostname;
                navigator.clipboard.writeText(domain);
                toast.success('Domain copied!');
              } catch {}
            }
          } else {
            // Copy full link
            if (handlers.selectedResult) {
              navigator.clipboard.writeText(handlers.selectedResult.link);
              toast.success('Link copied!');
            }
          }
          break;
        case 's':
          if (e.shiftKey && handlers.currentQuery) {
            e.preventDefault();
            const shareUrl = `${window.location.origin}?q=${encodeURIComponent(handlers.currentQuery)}`;
            navigator.clipboard.writeText(shareUrl);
            toast.success('Search URL copied!');
          }
          break;
        case 'd':
          if (e.shiftKey) {
            e.preventDefault();
            // Remove from bundle - could be implemented
          } else {
            e.preventDefault();
            handlers.onAddToBundle?.();
          }
          break;
        case 'p':
          e.preventDefault();
          handlers.onOpenSettings?.();
          break;
      }
      return;
    }

    // Skip remaining shortcuts if typing
    if (isTyping) return;

    // Number shortcuts for platforms (1-0)
    if (PLATFORM_NUMBER_SHORTCUTS[key]) {
      e.preventDefault();
      handlers.onPlatformChange?.(PLATFORM_NUMBER_SHORTCUTS[key]);
      // Animate platform chip
      const chip = document.querySelector(`[data-platform="${PLATFORM_NUMBER_SHORTCUTS[key]}"]`);
      if (chip) {
        chip.classList.add('animate-pulse');
        setTimeout(() => chip.classList.remove('animate-pulse'), 300);
      }
      return;
    }

    // Letter shortcuts for platforms
    if (PLATFORM_LETTER_SHORTCUTS[key]) {
      e.preventDefault();
      handlers.onPlatformChange?.(PLATFORM_LETTER_SHORTCUTS[key]);
      // Animate platform chip
      const chip = document.querySelector(`[data-platform="${PLATFORM_LETTER_SHORTCUTS[key]}"]`);
      if (chip) {
        chip.classList.add('animate-pulse');
        setTimeout(() => chip.classList.remove('animate-pulse'), 300);
      }
      return;
    }

    // Arrow navigation for results
    if (key === 'arrowup') {
      e.preventDefault();
      handlers.onNavigateResults?.('up');
      return;
    }

    if (key === 'arrowdown') {
      e.preventDefault();
      handlers.onNavigateResults?.('down');
      return;
    }

    // Enter to select result (when not in search input)
    if (key === 'enter' && !isTyping) {
      if (e.shiftKey) {
        e.preventDefault();
        handlers.onOpenInNewTab?.();
      } else {
        handlers.onSelectResult?.();
      }
      return;
    }
  }, [enabled, isTyping, handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { isTyping };
}

// Shortcut definitions for help overlay
export const SHORTCUT_GROUPS = [
  {
    title: 'Search & Navigation',
    shortcuts: [
      { keys: ['/', '⌘K'], action: 'Focus search / Command palette' },
      { keys: ['Esc'], action: 'Clear search / close modal' },
      { keys: ['Enter'], action: 'Run search' },
      { keys: ['⇧Enter'], action: 'Open in new tab' },
      { keys: ['↑', '↓'], action: 'Navigate results' },
    ],
  },
  {
    title: 'Platform Filters',
    shortcuts: [
      { keys: ['1'], action: 'All platforms' },
      { keys: ['2', 'V'], action: 'Vercel' },
      { keys: ['3', 'G'], action: 'GitHub' },
      { keys: ['4', 'N'], action: 'Netlify' },
      { keys: ['5', 'R'], action: 'Railway' },
      { keys: ['6'], action: 'Render' },
      { keys: ['7', 'B'], action: 'Bubble' },
      { keys: ['8', 'F'], action: 'Framer' },
      { keys: ['L'], action: 'Lovable' },
    ],
  },
  {
    title: 'Actions & Productivity',
    shortcuts: [
      { keys: ['⌘B'], action: 'Open Bundles' },
      { keys: ['⌘⇧B'], action: 'Create Bundle' },
      { keys: ['⌘L'], action: 'Copy site link' },
      { keys: ['⌘⇧L'], action: 'Copy domain only' },
      { keys: ['⌘D'], action: 'Add to bundle' },
      { keys: ['⌘⇧S'], action: 'Share current search' },
    ],
  },
  {
    title: 'UI Controls',
    shortcuts: [
      { keys: ['⌘,'], action: 'Open Settings' },
      { keys: ['⌘T'], action: 'Toggle theme' },
      { keys: ['?', '⌘/'], action: 'Show shortcuts' },
      { keys: ['Alt+A'], action: 'AI Agent Mode' },
    ],
  },
];
