import { useState } from "react";
import { User, Settings, Heart, Moon, Sun, LogOut, Users, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { FavoriteItem } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";

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
}

export function UserProfile({ user, favorites, onLogout, onShowFavorites, onShowSettings, onShowInvite }: UserProfileProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

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
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
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
        
        {onShowInvite && (
          <DropdownMenuItem onClick={closeAnd(onShowInvite)}>
            <Users className="mr-2 h-4 w-4" />
            <span>Invite Friends</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={closeAnd(onShowSettings)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={closeAnd(onLogout)} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}