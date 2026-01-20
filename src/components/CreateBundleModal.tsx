import { useState, useMemo, useEffect } from "react";
import type { KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Globe, Sparkles, Heart, FolderOpen } from "lucide-react";
import { BundleWebsite, POPULAR_SUGGESTIONS } from "@/hooks/useBundles";
import { toast } from "sonner";

interface FavoriteItem {
  url: string;
  name: string;
  folder?: string;
}

interface CreateBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBundle: (bundle: {
    name: string;
    description?: string;
    category: string;
    websites: BundleWebsite[];
  }) => Promise<any>;
  editingBundle?: any;
  favorites?: FavoriteItem[];
}

const CATEGORIES = [
  { value: "learning", label: "Learning" },
  { value: "shopping", label: "Shopping" },
  { value: "research", label: "Research" },
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "news", label: "News" },
  { value: "ai", label: "AI & ML" },
  { value: "social", label: "Social" },
  { value: "custom", label: "Custom" },
];

export function CreateBundleModal({
  isOpen,
  onClose,
  onCreateBundle,
  editingBundle,
  favorites = [],
}: CreateBundleModalProps) {
  const [name, setName] = useState(editingBundle?.name || "");
  const [description, setDescription] = useState(editingBundle?.description || "");
  const [category, setCategory] = useState(editingBundle?.category || "custom");
  const [websites, setWebsites] = useState<BundleWebsite[]>(editingBundle?.websites || []);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFavoritesImport, setShowFavoritesImport] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");

  // Update form when editingBundle changes
  useEffect(() => {
    if (editingBundle) {
      setName(editingBundle.name || "");
      setDescription(editingBundle.description || "");
      setCategory(editingBundle.category || "custom");
      setWebsites(editingBundle.websites || []);
    } else {
      // Reset form when creating new bundle
      setName("");
      setDescription("");
      setCategory("custom");
      setWebsites([]);
    }
    setWebsiteUrl("");
    setWebsiteName("");
    setShowFavoritesImport(false);
  }, [editingBundle, isOpen]);

  // Get unique folders from favorites
  const folders = useMemo(() => {
    const folderSet = new Set(favorites.map(f => f.folder || 'Uncategorized'));
    return ['all', ...Array.from(folderSet)];
  }, [favorites]);

  // Filter favorites by selected folder
  const filteredFavorites = useMemo(() => {
    if (selectedFolder === 'all') return favorites;
    return favorites.filter(f => (f.folder || 'Uncategorized') === selectedFolder);
  }, [favorites, selectedFolder]);

  // Get suggestions based on category and bundle name
  const suggestions = useMemo(() => {
    const categoryKey = category || "custom";
    const baseSuggestions = POPULAR_SUGGESTIONS[categoryKey] || POPULAR_SUGGESTIONS.custom;
    
    // Filter out already added websites
    return baseSuggestions.filter(
      (s) => !websites.some((w) => w.url === s.url)
    );
  }, [category, websites]);

  const handleAddWebsite = () => {
    if (!websiteUrl.trim()) return;
    if (websites.length >= 10) {
      toast.error("Maximum 10 websites per bundle");
      return;
    }

    // Clean up URL
    let cleanUrl = websiteUrl.trim().toLowerCase();
    cleanUrl = cleanUrl.replace(/^https?:\/\//, "").replace(/^www\./, "");
    cleanUrl = cleanUrl.split("/")[0]; // Get just the domain

    if (websites.some((w) => w.url === cleanUrl)) {
      toast.error("Website already added");
      return;
    }

    const newWebsite: BundleWebsite = {
      url: cleanUrl,
      name: websiteName.trim() || cleanUrl.split(".")[0],
    };

    setWebsites([...websites, newWebsite]);
    setWebsiteUrl("");
    setWebsiteName("");
  };

  const handleAddSuggestion = (suggestion: BundleWebsite) => {
    if (websites.length >= 10) {
      toast.error("Maximum 10 websites per bundle");
      return;
    }
    setWebsites([...websites, suggestion]);
  };

  const handleImportFromFavorites = () => {
    const favoritesToImport = filteredFavorites.slice(0, 10 - websites.length);
    const newWebsites: BundleWebsite[] = favoritesToImport.map(fav => ({
      url: fav.url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0],
      name: fav.name,
    }));
    
    // Filter out duplicates
    const uniqueWebsites = newWebsites.filter(
      nw => !websites.some(w => w.url === nw.url)
    );
    
    setWebsites([...websites, ...uniqueWebsites]);
    setShowFavoritesImport(false);
    toast.success(`Added ${uniqueWebsites.length} favorites to bundle`);
  };

  const handleRemoveWebsite = (url: string) => {
    setWebsites(websites.filter((w) => w.url !== url));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a bundle name");
      return;
    }
    if (websites.length === 0) {
      toast.error("Please add at least one website");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onCreateBundle({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        websites,
      });

      if (result) {
        toast.success("Bundle created successfully!");
        handleClose();
      } else {
        toast.error("Failed to create bundle");
      }
    } catch (error) {
      toast.error("Failed to create bundle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setCategory("custom");
    setWebsites([]);
    setWebsiteUrl("");
    setWebsiteName("");
    onClose();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWebsite();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {editingBundle ? "Edit Bundle" : "Create New Bundle"}
          </DialogTitle>
          <DialogDescription>
            Create a collection of websites to search within. Max 10 websites per bundle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bundle Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Bundle Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Research Bundle"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional, max 100 chars)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 100))}
              placeholder="A brief description of this bundle..."
              maxLength={100}
              rows={2}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/100
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Website */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Add Websites ({websites.length}/10)</Label>
              {favorites.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavoritesImport(!showFavoritesImport)}
                  className="h-7 text-xs"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Import from Favorites
                </Button>
              )}
            </div>

            {/* Favorites Import Panel */}
            {showFavoritesImport && (
              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <Label className="text-sm">Select Folder</Label>
                </div>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder === 'all' ? 'All Favorites' : folder} ({folder === 'all' ? favorites.length : favorites.filter(f => (f.folder || 'Uncategorized') === folder).length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleImportFromFavorites}
                    disabled={filteredFavorites.length === 0 || websites.length >= 10}
                    className="flex-1"
                  >
                    Import {Math.min(filteredFavorites.length, 10 - websites.length)} Sites
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFavoritesImport(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="example.com"
                />
                <Input
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Display name (optional)"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddWebsite}
                disabled={!websiteUrl.trim() || websites.length >= 10}
                className="h-[74px]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Added Websites */}
          {websites.length > 0 && (
            <div className="space-y-2">
              <Label>Added Websites</Label>
              <div className="flex flex-wrap gap-2">
                {websites.map((website) => (
                  <Badge
                    key={website.url}
                    variant="secondary"
                    className="flex items-center gap-1 py-1 px-2"
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${website.url}&sz=16`}
                      alt=""
                      className="w-3 h-3"
                    />
                    <span>{website.name}</span>
                    <button
                      onClick={() => handleRemoveWebsite(website.url)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Popular Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Popular Suggestions
              </Label>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 5).map((suggestion) => (
                  <button
                    key={suggestion.url}
                    onClick={() => handleAddSuggestion(suggestion)}
                    disabled={websites.length >= 10}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${suggestion.url}&sz=16`}
                      alt=""
                      className="w-3 h-3"
                    />
                    <span>{suggestion.name}</span>
                    <Plus className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || websites.length === 0}
          >
            {isSubmitting ? (editingBundle ? "Updating..." : "Creating...") : (editingBundle ? "Update Bundle" : "Create Bundle")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
