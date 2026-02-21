import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Check,
  X,
  ExternalLink,
  Users,
  Package,
  Image,
  Search,
  Heart,
  Globe,
  Trash2,
  RefreshCw,
  Settings,
  Database,
  BarChart3,
  Megaphone,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  MousePointer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Ad, adStorage } from "@/lib/adStorage";

interface WebsiteSuggestion {
  id: string;
  website: string;
  category: string;
  description: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface StorageStats {
  localStorage: { used: string; items: number };
  indexedDB: { available: boolean };
}

type TabType = "overview" | "ads" | "suggestions" | "platforms" | "storage" | "settings";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
}

export function AdminPanel({ isOpen, onClose, initialTab }: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [suggestions, setSuggestions] = useState<WebsiteSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "overview");
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [adForm, setAdForm] = useState({
    title: "",
    description: "",
    link: "",
    displayUrl: "",
    imageUrl: "",
    keywords: "",
    isPowerAd: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadSuggestions();
      loadStorageStats();
      loadAds();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadAds = () => {
    setAds(adStorage.getAds());
  };

  const loadSuggestions = () => {
    const saved = JSON.parse(
      localStorage.getItem("yourel_suggestions") || "[]"
    );
    setSuggestions(saved);
  };

  const loadStorageStats = () => {
    // Calculate localStorage usage
    let totalSize = 0;
    let itemCount = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
        itemCount++;
      }
    }

    setStorageStats({
      localStorage: {
        used: (totalSize / 1024).toFixed(2) + " KB",
        items: itemCount,
      },
      indexedDB: { available: "indexedDB" in window },
    });
  };

  const handleAuthenticate = () => {
    if (password === "686") {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const updateSuggestionStatus = (
    id: string,
    status: "approved" | "rejected"
  ) => {
    const updated = suggestions.map((s) =>
      s.id === id ? { ...s, status } : s
    );
    setSuggestions(updated);
    localStorage.setItem("yourel_suggestions", JSON.stringify(updated));

    toast({
      title: status === "approved" ? "Approved" : "Rejected",
      description: `Website suggestion has been ${status}`,
    });
  };

  const clearLocalStorage = (key?: string) => {
    if (key) {
      localStorage.removeItem(key);
      toast({ title: "Cleared", description: `Removed ${key}` });
    } else {
      const keysToKeep = ["theme"];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((k) => {
        if (!keysToKeep.includes(k)) {
          localStorage.removeItem(k);
        }
      });
      toast({ title: "Cleared", description: "All app data cleared" });
    }
    loadStorageStats();
  };

  // Ad management functions
  const resetAdForm = () => {
    setAdForm({
      title: "",
      description: "",
      link: "",
      displayUrl: "",
      imageUrl: "",
      keywords: "",
      isPowerAd: false,
    });
    setEditingAd(null);
    setShowAdForm(false);
  };

  const handleAdLinkChange = (url: string) => {
    setAdForm(prev => ({ ...prev, link: url }));
    // Auto-generate display URL from link
    try {
      const urlObj = new URL(url);
      setAdForm(prev => ({ ...prev, displayUrl: urlObj.hostname + urlObj.pathname }));
    } catch {
      // Invalid URL, don't update displayUrl
    }
  };

  const handleSaveAd = () => {
    if (!adForm.title || !adForm.link) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title and link",
        variant: "destructive",
      });
      return;
    }

    // Power ads don't need keywords
    if (!adForm.isPowerAd && !adForm.keywords) {
      toast({
        title: "Missing Keywords",
        description: "Regular ads need keywords. Enable Power Ad to skip keywords.",
        variant: "destructive",
      });
      return;
    }

    const keywordsArray = adForm.keywords.split(",").map(k => k.trim()).filter(Boolean);

    if (editingAd) {
      adStorage.updateAd(editingAd.id, {
        title: adForm.title,
        description: adForm.description,
        link: adForm.link,
        displayUrl: adForm.displayUrl || new URL(adForm.link).hostname,
        imageUrl: adForm.imageUrl || undefined,
        keywords: keywordsArray,
        isPowerAd: adForm.isPowerAd,
      });
      toast({ title: "Ad Updated", description: "Your ad has been updated" });
    } else {
      adStorage.addAd({
        title: adForm.title,
        description: adForm.description,
        link: adForm.link,
        displayUrl: adForm.displayUrl || new URL(adForm.link).hostname,
        imageUrl: adForm.imageUrl || undefined,
        keywords: keywordsArray,
        isActive: true,
        isPowerAd: adForm.isPowerAd,
      });
      toast({ title: "Ad Created", description: "Your ad is now active" });
    }

    resetAdForm();
    loadAds();
  };

  const handleEditAd = (ad: Ad) => {
    setAdForm({
      title: ad.title,
      description: ad.description,
      link: ad.link,
      displayUrl: ad.displayUrl,
      imageUrl: ad.imageUrl || "",
      keywords: ad.keywords.join(", "),
      isPowerAd: ad.isPowerAd || false,
    });
    setEditingAd(ad);
    setShowAdForm(true);
  };

  const handleDeleteAd = (id: string) => {
    adStorage.deleteAd(id);
    loadAds();
    toast({ title: "Ad Deleted", description: "The ad has been removed" });
  };

  const handleToggleAdStatus = (id: string) => {
    adStorage.toggleAdStatus(id);
    loadAds();
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const reviewedSuggestions = suggestions.filter((s) => s.status !== "pending");

  // Platform stats
  const platforms = [
    { name: "Vercel", domain: "vercel.app", color: "bg-black" },
    { name: "GitHub", domain: "github.io", color: "bg-gray-700" },
    { name: "Netlify", domain: "netlify.app", color: "bg-teal-500" },
    { name: "Railway", domain: "railway.app", color: "bg-purple-600" },
    { name: "Render", domain: "onrender.com", color: "bg-emerald-500" },
    { name: "Bubble", domain: "bubbleapps.io", color: "bg-blue-500" },
    { name: "Framer", domain: "framer.website", color: "bg-pink-500" },
    { name: "Replit", domain: "replit.app", color: "bg-orange-500" },
    { name: "Bolt", domain: "bolt.host", color: "bg-yellow-500" },
    { name: "Fly.io", domain: "fly.dev", color: "bg-violet-600" },
    { name: "Lovable", domain: "lovable.app", color: "bg-pink-500" },
    { name: "Emergent", domain: "emergent.host", color: "bg-cyan-500" },
    { name: "Hugging Face", domain: "huggingface.co/spaces", color: "bg-yellow-400" },
  ];

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Access
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">
                Enter admin password to access the panel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAuthenticate()}
              />
            </div>

            <Button
              onClick={handleAuthenticate}
              disabled={!password.trim()}
              className="w-full"
            >
              Access Admin Panel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Yourel Admin Panel
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "ads", label: "Ads", icon: Megaphone },
            { id: "suggestions", label: "Suggestions", icon: Globe },
            { id: "platforms", label: "Platforms", icon: Search },
            { id: "storage", label: "Storage", icon: Database },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Dashboard Overview</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Megaphone className="w-4 h-4" />
                    <span className="text-xs">Ads</span>
                  </div>
                  <p className="text-2xl font-bold">{ads.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {ads.filter(a => a.isActive).length} active
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs">Suggestions</span>
                  </div>
                  <p className="text-2xl font-bold">{suggestions.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingSuggestions.length} pending
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Search className="w-4 h-4" />
                    <span className="text-xs">Platforms</span>
                  </div>
                  <p className="text-2xl font-bold">{platforms.length}</p>
                  <p className="text-xs text-muted-foreground">searchable</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Database className="w-4 h-4" />
                    <span className="text-xs">Storage</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {storageStats?.localStorage.used || "..."}
                  </p>
                  <p className="text-xs text-muted-foreground">localStorage</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-medium mb-3">Current Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Multi-platform search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Daily Unsplash backgrounds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Custom background upload</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Bundles (site collections)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Favorites system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Keyboard shortcuts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>AI search summaries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Dark/Light theme</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ads Tab */}
          {activeTab === "ads" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Sponsored Ads</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage ads that appear at the top of search results
                  </p>
                </div>
                <Button onClick={() => setShowAdForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Ad
                </Button>
              </div>

              {/* Ad Form */}
              {showAdForm && (
                <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {editingAd ? "Edit Ad" : "Create New Ad"}
                    </h4>
                    <Button variant="ghost" size="sm" onClick={resetAdForm}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ad-title">Title *</Label>
                      <Input
                        id="ad-title"
                        placeholder="Ad headline"
                        value={adForm.title}
                        onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ad-link">Link URL *</Label>
                      <Input
                        id="ad-link"
                        placeholder="https://example.com"
                        value={adForm.link}
                        onChange={(e) => handleAdLinkChange(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ad-description">Description</Label>
                      <Textarea
                        id="ad-description"
                        placeholder="Brief description of the ad (shown below title)"
                        value={adForm.description}
                        onChange={(e) => setAdForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ad-display-url">Display URL</Label>
                      <Input
                        id="ad-display-url"
                        placeholder="example.com/page"
                        value={adForm.displayUrl}
                        onChange={(e) => setAdForm(prev => ({ ...prev, displayUrl: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled from link</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ad-image">Image URL (optional)</Label>
                      <Input
                        id="ad-image"
                        placeholder="https://example.com/image.jpg"
                        value={adForm.imageUrl}
                        onChange={(e) => setAdForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ad-keywords">Keywords {!adForm.isPowerAd && "*"} (comma-separated)</Label>
                      <Input
                        id="ad-keywords"
                        placeholder="hosting, web, deploy, cloud"
                        value={adForm.keywords}
                        onChange={(e) => setAdForm(prev => ({ ...prev, keywords: e.target.value }))}
                        disabled={adForm.isPowerAd}
                      />
                      <p className="text-xs text-muted-foreground">
                        {adForm.isPowerAd ? "Power Ad shows on every search" : "Ad shows when user searches for these keywords"}
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                        <input
                          type="checkbox"
                          id="ad-power"
                          checked={adForm.isPowerAd}
                          onChange={(e) => setAdForm(prev => ({ ...prev, isPowerAd: e.target.checked }))}
                          className="w-4 h-4 rounded border-border"
                        />
                        <div className="flex-1">
                          <Label htmlFor="ad-power" className="font-medium cursor-pointer">
                            ⚡ Power Ad
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Shows on every search regardless of keywords (premium placement)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {adForm.title && adForm.link && (
                    <div className="p-3 rounded-lg border border-dashed border-border bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-600 border border-amber-500/30">
                          Sponsored
                        </span>
                        {adForm.isPowerAd && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-600 border border-purple-500/30">
                            ⚡ 
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {adForm.link && (
                          <img 
                            src={adStorage.getFaviconUrl(adForm.link)} 
                            alt="" 
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {adForm.displayUrl || "example.com"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary">{adForm.title}</p>
                      {adForm.description && (
                        <p className="text-xs text-muted-foreground mt-1">{adForm.description}</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetAdForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAd}>
                      {editingAd ? "Update Ad" : "Create Ad"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Ads List */}
              <div className="space-y-3">
                {ads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No ads created yet</p>
                    <p className="text-sm">Click "Add Ad" to create your first sponsored result</p>
                  </div>
                ) : (
                  ads.map((ad) => (
                    <div
                      key={ad.id}
                      className={`p-4 rounded-xl border ${ad.isActive ? 'border-border' : 'border-border/50 opacity-60'} bg-card`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Favicon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <img 
                            src={adStorage.getFaviconUrl(ad.link)} 
                            alt="" 
                            className="w-6 h-6"
                            onError={(e) => { 
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{ad.title}</h4>
                            <Badge variant={ad.isActive ? "default" : "secondary"}>
                              {ad.isActive ? "Active" : "Paused"}
                            </Badge>
                            {ad.isPowerAd && (
                              <Badge className="bg-purple-500 hover:bg-purple-600">
                                ⚡ POWER
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {ad.displayUrl}
                          </p>
                          {ad.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {ad.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {ad.impressions} views
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              {ad.clicks} clicks
                            </span>
                            <span>
                              {ad.isPowerAd ? "⚡ Power Ad (shows on all searches)" : `Keywords: ${ad.keywords.slice(0, 3).join(", ")}`}
                              {!ad.isPowerAd && ad.keywords.length > 3 && ` +${ad.keywords.length - 3}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAdStatus(ad.id)}
                            title={ad.isActive ? "Pause ad" : "Activate ad"}
                          >
                            {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAd(ad)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAd(ad.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Stats Summary */}
              {ads.length > 0 && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{ads.length}</p>
                    <p className="text-xs text-muted-foreground">Total Ads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {ads.reduce((sum, ad) => sum + ad.impressions, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {ads.reduce((sum, ad) => sum + ad.clicks, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Clicks</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === "suggestions" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Pending Review ({pendingSuggestions.length})
                </h3>
                {pendingSuggestions.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No pending suggestions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <a
                                href={suggestion.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                              >
                                {suggestion.website}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <Badge variant="outline">
                                {suggestion.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted:{" "}
                              {new Date(suggestion.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateSuggestionStatus(suggestion.id, "approved")
                              }
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateSuggestionStatus(suggestion.id, "rejected")
                              }
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {reviewedSuggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Reviewed ({reviewedSuggestions.length})
                  </h3>
                  <div className="space-y-2">
                    {reviewedSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="border rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <a
                            href={suggestion.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {suggestion.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <Badge
                          variant={
                            suggestion.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {suggestion.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Platforms Tab */}
          {activeTab === "platforms" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Supported Platforms</h3>
              <p className="text-sm text-muted-foreground">
                These platforms are searchable via the platform filter chips.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${platform.color}`}
                    />
                    <div>
                      <p className="font-medium text-sm">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {platform.domain}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Tab */}
          {activeTab === "storage" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Storage Management</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border">
                  <h4 className="font-medium mb-2">localStorage</h4>
                  <p className="text-2xl font-bold">
                    {storageStats?.localStorage.used}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {storageStats?.localStorage.items} items stored
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <h4 className="font-medium mb-2">IndexedDB (Dexie)</h4>
                  <p className="text-2xl font-bold">
                    {storageStats?.indexedDB.available ? "Available" : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For custom backgrounds
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Clear Data</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearLocalStorage("yourel-unsplash-daily")}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Daily Images Cache
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearLocalStorage("yourel-selected-background")}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Selected Background
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearLocalStorage("yourel_suggestions")}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Suggestions
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => clearLocalStorage()}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear All App Data
                  </Button>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={loadStorageStats}
                className="mt-4"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Stats
              </Button>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Admin Settings</h3>

              <div className="p-4 rounded-xl border border-border space-y-3">
                <h4 className="font-medium">Access Info</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Shortcut:</span>{" "}
                    <kbd className="px-2 py-0.5 bg-muted rounded text-xs">
                      Ctrl+Shift+A
                    </kbd>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Password:</span> 686
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border space-y-3">
                <h4 className="font-medium">Background System</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• 28 curated Unsplash images across 8 categories</p>
                  <p>• 5 images selected daily (seeded by date)</p>
                  <p>• Rotates on each page refresh</p>
                  <p>• Custom uploads stored in IndexedDB via Dexie.js</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border space-y-3">
                <h4 className="font-medium">Search System</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Google Custom Search API</p>
                  <p>• 12 platform filters</p>
                  <p>• AI-powered summaries</p>
                  <p>• Bundles for custom site collections</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
