import { useState, useEffect } from "react";
import { User, Settings, Heart, Moon, Sun, LogOut, Users, Copy, Keyboard, Bot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useBackground } from "@/contexts/BackgroundContext";
import { FavoriteItem } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";

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

interface UserProfileProps {
  user: {
    email?: string;
    full_name?: string | null;
  };
  favorites: FavoriteItem[];
  onLogout: () => void;
  onShowFavorites: () => void;
  onShowSettings: () => void;
  onShowInvite?: () => void;
  onShowShortcuts?: () => void;
  onShowAIAgent?: () => void;
}

export function UserProfile({ user, favorites, onLogout, onShowFavorites, onShowSettings, onShowInvite, onShowShortcuts, onShowAIAgent }: UserProfileProps) {
  const { theme, toggleTheme } = useTheme();
  const { showBackgrounds } = useBackground();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const displayName = user.full_name || user.email || 'User';
  const initials = displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) || 'U';
  const closeAnd = (action: () => void) => () => {
    setIsOpen(false);
    action();
  };

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-2 hover:scale-105 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C82F4] to-[#8243ED] flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {initials}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-liquid">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className={`text-sm leading-none ${showBackgrounds ? 'font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'font-medium'}`}>{displayName}</p>
            {user.email && <p className={`text-xs leading-none ${showBackgrounds ? 'text-white/90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]' : 'text-muted-foreground'}`}>{user.email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={closeAnd(toggleTheme)}>
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={closeAnd(onShowFavorites)}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Favorites ({favorites.length})</span>
        </DropdownMenuItem>
        
        {/* AI Agent */}
        {onShowAIAgent && (
          <DropdownMenuItem onClick={closeAnd(onShowAIAgent)} className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <Bot className="mr-2 h-4 w-4 text-purple-500" />
            <span>AI Agent</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full">New</span>
          </DropdownMenuItem>
        )}
        
        {onShowInvite && (
          <DropdownMenuItem onClick={closeAnd(onShowInvite)}>
            <Users className="mr-2 h-4 w-4" />
            <span>Invite Friends</span>
          </DropdownMenuItem>
        )}
        
        {/* Only show Settings (Customize Page) on PC/tablet, not mobile */}
        {!isMobile && (
          <DropdownMenuItem onClick={closeAnd(onShowSettings)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Customize Page</span>
          </DropdownMenuItem>
        )}
        
        {/* Keyboard Shortcuts - only on desktop */}
        {!isMobile && onShowShortcuts && (
          <DropdownMenuItem onClick={closeAnd(onShowShortcuts)}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
            <kbd className="ml-auto text-[10px] px-1.5 py-0.5 bg-muted border border-border rounded">?</kbd>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={closeAnd(onLogout)} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}