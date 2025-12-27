import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, Trash2 } from "lucide-react";
import { FavoriteItem } from "@/hooks/useSupabaseAuth";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemoveFromFavorites: (url: string) => void;
}

export function FavoritesModal({ isOpen, onClose, favorites, onRemoveFromFavorites }: FavoritesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Your Favorites ({favorites.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No favorites yet</p>
              <p className="text-sm text-muted-foreground">
                Click the heart icon on search results to add them here
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
