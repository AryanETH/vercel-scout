import { useState, useEffect, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Search,
  Settings,
  Moon,
  Sun,
  Package,
  Heart,
  Link,
  Share2,
  Copy,
  Keyboard,
  LogOut,
  User,
  Bot,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Platform } from '@/components/PlatformFilters';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch?: (query: string) => void;
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
  onOpenBundles?: () => void;
  onCreateBundle?: () => void;
  onShowFavorites?: () => void;
  onShowShortcuts?: () => void;
  onOpenAIAgent?: () => void;
  onPlatformChange?: (platform: Platform) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  currentQuery?: string;
  selectedResult?: { title: string; link: string } | null;
}

const PLATFORMS: { id: Platform; name: string; shortcut: string }[] = [
  { id: 'all', name: 'All Platforms', shortcut: '1' },
  { id: 'vercel', name: 'Vercel', shortcut: 'V' },
  { id: 'github', name: 'GitHub', shortcut: 'G' },
  { id: 'netlify', name: 'Netlify', shortcut: 'N' },
  { id: 'railway', name: 'Railway', shortcut: '5' },
  { id: 'onrender', name: 'Render', shortcut: '6' },
  { id: 'bubble', name: 'Bubble', shortcut: 'B' },
  { id: 'framer', name: 'Framer', shortcut: 'F' },
  { id: 'replit', name: 'Replit', shortcut: '9' },
  { id: 'lovable', name: 'Lovable', shortcut: 'L' },
];

export function CommandPalette({
  open,
  onOpenChange,
  onSearch,
  onToggleTheme,
  onOpenSettings,
  onOpenBundles,
  onCreateBundle,
  onShowFavorites,
  onShowShortcuts,
  onOpenAIAgent,
  onPlatformChange,
  onLogout,
  isAuthenticated,
  currentQuery,
  selectedResult,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const handleSelect = useCallback((action: () => void) => {
    onOpenChange(false);
    action();
  }, [onOpenChange]);

  const handleSearch = useCallback(() => {
    if (searchValue.trim() && onSearch) {
      onOpenChange(false);
      onSearch(searchValue.trim());
    }
  }, [searchValue, onSearch, onOpenChange]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onOpenChange(false);
  }, [onOpenChange]);

  const shareSearch = useCallback(() => {
    if (currentQuery) {
      const shareUrl = `${window.location.origin}?q=${encodeURIComponent(currentQuery)}`;
      navigator.clipboard.writeText(shareUrl);
      onOpenChange(false);
    }
  }, [currentQuery, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={searchValue}
        onValueChange={setSearchValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && searchValue.trim()) {
            e.preventDefault();
            handleSearch();
          }
        }}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Search */}
        {searchValue.trim() && (
          <CommandGroup heading="Search">
            <CommandItem onSelect={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search for "{searchValue}"
            </CommandItem>
          </CommandGroup>
        )}

        {/* AI Agent */}
        <CommandGroup heading="AI Agent">
          <CommandItem onSelect={() => handleSelect(() => onOpenAIAgent?.())}>
            <Bot className="mr-2 h-4 w-4" />
            <span>Open AI Agent Mode</span>
            <span className="ml-auto text-xs text-muted-foreground">Alt+A</span>
          </CommandItem>
        </CommandGroup>

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect(() => onToggleTheme?.())}>
            {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Toggle {isDark ? 'Light' : 'Dark'} Mode</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘T</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onOpenSettings?.())}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Open Settings</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘,</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => onShowShortcuts?.())}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
            <span className="ml-auto text-xs text-muted-foreground">?</span>
          </CommandItem>
        </CommandGroup>

        {/* Bundles */}
        {isAuthenticated && (
          <CommandGroup heading="Bundles">
            <CommandItem onSelect={() => handleSelect(() => onOpenBundles?.())}>
              <Package className="mr-2 h-4 w-4" />
              <span>Open Bundles</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘B</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => onCreateBundle?.())}>
              <Package className="mr-2 h-4 w-4" />
              <span>Create New Bundle</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧B</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Favorites */}
        {isAuthenticated && (
          <CommandGroup heading="Favorites">
            <CommandItem onSelect={() => handleSelect(() => onShowFavorites?.())}>
              <Heart className="mr-2 h-4 w-4" />
              <span>View Favorites</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Clipboard Actions */}
        {selectedResult && (
          <CommandGroup heading="Selected Result">
            <CommandItem onSelect={() => copyToClipboard(selectedResult.link, 'Link')}>
              <Link className="mr-2 h-4 w-4" />
              <span>Copy Site Link</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘L</span>
            </CommandItem>
            <CommandItem onSelect={() => {
              const domain = new URL(selectedResult.link).hostname;
              copyToClipboard(domain, 'Domain');
            }}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Domain Only</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧L</span>
            </CommandItem>
            <CommandItem onSelect={() => window.open(selectedResult.link, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Open in New Tab</span>
              <span className="ml-auto text-xs text-muted-foreground">⇧↵</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Share */}
        {currentQuery && (
          <CommandGroup heading="Share">
            <CommandItem onSelect={shareSearch}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share Current Search</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧S</span>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Platform Filters */}
        <CommandGroup heading="Platform Filters">
          {PLATFORMS.map((platform) => (
            <CommandItem
              key={platform.id}
              onSelect={() => handleSelect(() => onPlatformChange?.(platform.id))}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>{platform.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{platform.shortcut}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Account */}
        {isAuthenticated && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => handleSelect(() => onLogout?.())}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {!isAuthenticated && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => handleSelect(() => navigate('/auth'))}>
                <User className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
