import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ExternalLink, Trash2, Share2, Copy, Plus } from "lucide-react";
import { FavoriteItem } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemoveFromFavorites: (url: string) => void;
  onAddToFavorites?: (url: string, name: string) => void;
  username?: string | null;
}

export function FavoritesModal({ isOpen, onClose, favorites, onRemoveFromFavorites, onAddToFavorites, username }: FavoritesModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const profileUrl = username ? `${window.location.origin}/u/${username}` : null;

  const handleShare = async () => {
    if (!profileUrl) {
      toast.error('Set a username to share your favorites');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Favorites on Yourel`,
          text: `Check out my favorite websites on Yourel!`,
          url: profileUrl
        });
      } catch {
        copyProfileLink();
      }
    } else {
      copyProfileLink();
    }
  };

  const copyProfileLink = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const handleAddSite = async () => {
    if (!newUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Validate URL
    let validUrl = newUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    // Check if already in favorites
    if (favorites.some(fav => fav.url === validUrl)) {
      toast.error('This site is already in your favorites');
      return;
    }

    setIsAdding(true);
    try {
      const siteName = new URL(validUrl).hostname.replace('www.', '');
      if (onAddToFavorites) {
        await onAddToFavorites(validUrl, siteName);
      }
      setNewUrl("");
      setShowAddForm(false);
    } catch {
      toast.error('Failed to add site');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] rounded-xl">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              Your Favorites ({favorites.length})
            </DialogTitle>
            {username && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyProfileLink}
                  className="gap-1.5 h-8 text-xs sm:text-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleShare}
                  className="gap-1.5 h-8 text-xs sm:text-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
              </div>
            )}
          </div>
          {username && (
            <p className="text-xs text-muted-foreground mt-2">
              Public profile: {profileUrl}
            </p>
          )}
        </DialogHeader>
        
        {/* Add Site Section */}
        <div className="mb-4">
          {showAddForm ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter website URL (e.g., example.com)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
                className="flex-1"
              />
              <Button onClick={handleAddSite} disabled={isAdding} size="sm">
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setNewUrl(""); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add a site manually
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No favorites yet</p>
              <p className="text-sm text-muted-foreground">
                Click the heart icon on search results or add a site manually
              </p>
            </div>
          ) : (
            favorites.map((favorite) => {
              const displayUrl = favorite.url.replace(/^https?:\/\//, "").split("/")[0];
              
              return (
                <div key={favorite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <a 
                      href={favorite.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium flex items-center gap-2"
                    >
                      <span className="truncate">{favorite.name || displayUrl}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {displayUrl}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromFavorites(favorite.url)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
