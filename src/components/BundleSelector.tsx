import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Bundle, SAMPLE_BUNDLES } from "@/hooks/useBundles";
import {
  ChevronDown,
  Package,
  X,
  Plus,
  Trash2,
  Share2,
  Globe,
  BookOpen,
  ShoppingCart,
  Search as SearchIcon,
  Code,
  Palette,
  Newspaper,
  Sparkles,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BundleSelectorProps {
  bundles: Bundle[];
  activeBundle: Bundle | null;
  onSelectBundle: (bundle: Bundle | null) => void;
  onCreateBundle: () => void;
  onDeleteBundle?: (bundleId: string) => void;
  sampleBundles?: typeof SAMPLE_BUNDLES;
  username?: string;
}

const categoryIcons: Record<string, ReactNode> = {
  education: <BookOpen className="w-4 h-4" />,
  learning: <BookOpen className="w-4 h-4" />,
  shopping: <ShoppingCart className="w-4 h-4" />,
  research: <SearchIcon className="w-4 h-4" />,
  development: <Code className="w-4 h-4" />,
  design: <Palette className="w-4 h-4" />,
  news: <Newspaper className="w-4 h-4" />,
  ai: <Sparkles className="w-4 h-4" />,
  custom: <Globe className="w-4 h-4" />,
};

export function BundleSelector({
  bundles,
  activeBundle,
  onSelectBundle,
  onCreateBundle,
  onDeleteBundle,
  sampleBundles = SAMPLE_BUNDLES,
  username,
}: BundleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectBundle = (bundle: Bundle | typeof SAMPLE_BUNDLES[0]) => {
    // Convert sample bundle to Bundle format if needed
    const fullBundle: Bundle = "id" in bundle ? bundle : {
      id: `sample-${bundle.name.toLowerCase().replace(/\s+/g, "-")}`,
      user_id: null,
      name: bundle.name,
      description: bundle.description,
      category: bundle.category,
      websites: bundle.websites,
      is_public: bundle.is_public,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSelectBundle(fullBundle);
    setIsOpen(false);
  };

  const handleClearBundle = (e: MouseEvent) => {
    e.stopPropagation();
    onSelectBundle(null);
  };

  const handleShareBundle = (bundle: Bundle, e: MouseEvent) => {
    e.stopPropagation();
    // Use the user profile URL with bundle parameter (works with existing RLS)
    const shareUrl = username
      ? `${window.location.origin}/u/${username}?bundle=${bundle.id}`
      : `${window.location.origin}/u/shared?bundle=${bundle.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Bundle link copied to clipboard!");
  };

  const handleDeleteBundle = (bundleId: string, e: MouseEvent) => {
    e.stopPropagation();
    onDeleteBundle?.(bundleId);
    toast.success("Bundle deleted");
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={activeBundle ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-2 transition-all",
              activeBundle && "bg-primary text-primary-foreground"
            )}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">
              {activeBundle ? activeBundle.name : "Bundles"}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 max-h-[400px] overflow-y-auto bg-popover z-50">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Select Bundle</span>
            {activeBundle && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleClearBundle}
              >
                <X className="w-3 h-3 mr-1" />
                Clear Filter
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* User's custom bundles */}
          {bundles.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Your Bundles
              </DropdownMenuLabel>
              {bundles.map((bundle) => (
                <DropdownMenuItem
                  key={bundle.id}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={() => handleSelectBundle(bundle)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {categoryIcons[bundle.category] || <Globe className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{bundle.name}</span>
                      {activeBundle?.id === bundle.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    {bundle.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {bundle.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {bundle.websites.length} sites
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleShareBundle(bundle, e)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteBundle(bundle.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Sample bundles */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Pre-made Bundles
          </DropdownMenuLabel>
          {sampleBundles.map((bundle, index) => (
            <DropdownMenuItem
              key={index}
              className="flex items-start gap-3 p-3 cursor-pointer"
              onClick={() => handleSelectBundle(bundle)}
            >
              <div className="flex-shrink-0 mt-0.5">
                {categoryIcons[bundle.category] || <Globe className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{bundle.name}</span>
                  {activeBundle?.name === bundle.name && !activeBundle?.user_id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                {bundle.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {bundle.description}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {bundle.websites.length} sites
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer text-primary"
            onClick={() => {
              onCreateBundle();
              setIsOpen(false);
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Create New Bundle</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active bundle indicator */}
      {activeBundle && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-xs font-medium text-primary">
            Searching in: {activeBundle.name}
          </span>
          <button
            onClick={() => onSelectBundle(null)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
