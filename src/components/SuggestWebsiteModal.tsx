import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, CheckCircle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { searchApi } from "@/lib/api/search";

interface SuggestWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestWebsiteModal({ isOpen, onClose }: SuggestWebsiteModalProps) {
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crawlResult, setCrawlResult] = useState<{ title: string; platform: string } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!website.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    let formattedUrl = website.trim();
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setCrawlResult(null);

    try {
      // Crawl and index the site
      const result = await searchApi.crawlSite(formattedUrl, true);

      if (result.success && result.site) {
        setCrawlResult({
          title: result.site.title,
          platform: result.site.platform,
        });

        toast({
          title: "Site Indexed! 🎉",
          description: `"${result.site.title}" is now searchable on Yourel`,
        });

        // Reset form after a short delay
        setTimeout(() => {
          setWebsite("");
          setCrawlResult(null);
          onClose();
        }, 2000);
      } else {
        toast({
          title: "Indexing Failed",
          description: result.error || "Could not index this site. Please try another URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add a Website
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">
              Add any website to Yourel's search index. We'll crawl it and make it searchable instantly.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="website"
                placeholder="example.vercel.app"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !website.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isSubmitting && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-sm">Crawling & Indexing...</p>
                <p className="text-xs text-muted-foreground">This may take a few seconds</p>
              </div>
            </div>
          )}

          {crawlResult && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm text-green-700 dark:text-green-400">
                  {crawlResult.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Indexed on {crawlResult.platform}
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            Supported platforms: Vercel, GitHub, Netlify, Railway, Render, Bubble, Framer, Replit, Bolt, Fly.io, Lovable
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
