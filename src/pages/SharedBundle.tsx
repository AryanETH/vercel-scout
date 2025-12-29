import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft, Loader2, Package, Globe, Copy, Search, Plus, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { BundleWebsite } from '@/hooks/useBundles';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface BundleData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  websites: BundleWebsite[];
  user_id: string;
}

export default function SharedBundlePage() {
  const { bundleId } = useParams<{ bundleId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSupabaseAuth();
  
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [alreadyAdded, setAlreadyAdded] = useState(false);

  useEffect(() => {
    const fetchBundle = async () => {
      if (!bundleId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Fetch the bundle by ID (anyone with the link can view)
      const { data: bundleData, error: bundleError } = await supabase
        .from('bundles')
        .select('*')
        .eq('id', bundleId)
        .maybeSingle();

      if (bundleError || !bundleData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const websites = typeof bundleData.websites === 'string' 
        ? JSON.parse(bundleData.websites) 
        : bundleData.websites || [];
      
      setBundle({ ...bundleData, websites });

      // Fetch owner's name
      if (bundleData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', bundleData.user_id)
          .maybeSingle();
        
        if (profileData) {
          setOwnerName(profileData.full_name || profileData.username || 'Someone');
        }
      }

      // Check if current user already has this bundle (by name match)
      if (user) {
        const { data: existingBundles } = await supabase
          .from('bundles')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', bundleData.name);
        
        if (existingBundles && existingBundles.length > 0) {
          setAlreadyAdded(true);
        }
      }

      setIsLoading(false);
    };

    fetchBundle();
  }, [bundleId, user]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/bundle/${bundleId}`;
    navigator.clipboard.writeText(url);
    toast.success('Bundle link copied!');
  };

  const handleSearchWithBundle = () => {
    if (!bundle) return;
    const siteFilters = bundle.websites.map(w => `site:${w.url}`).join(' OR ');
    navigate(`/?bundleFilter=${encodeURIComponent(siteFilters)}&bundleName=${encodeURIComponent(bundle.name)}`);
  };

  const handleAddToLibrary = async () => {
    if (!bundle || !user) {
      toast.error('Please sign in to add this bundle to your library');
      navigate('/auth');
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('bundles')
        .insert({
          user_id: user.id,
          name: bundle.name,
          description: bundle.description,
          category: bundle.category,
          websites: JSON.stringify(bundle.websites),
          is_public: false,
        });

      if (error) throw error;

      setAlreadyAdded(true);
      toast.success('Bundle added to your library!');
    } catch (error) {
      console.error('Error adding bundle:', error);
      toast.error('Failed to add bundle');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !bundle) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-4 py-4 md:px-12 border-b border-border">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo />
            </Link>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Bundle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This bundle doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-4 md:px-12 border-b border-border">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Package className="w-4 h-4" />
              <span>Shared Bundle {ownerName && `by ${ownerName}`}</span>
            </div>
            <CardTitle className="text-2xl">{bundle.name}</CardTitle>
            {bundle.description && (
              <p className="text-muted-foreground mt-2">{bundle.description}</p>
            )}
            <span className="inline-block mt-3 px-3 py-1 text-xs bg-primary/10 text-primary rounded-full capitalize">
              {bundle.category}
            </span>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Websites List */}
            <div>
              <p className="text-sm font-medium mb-3">
                {bundle.websites.length} websites in this bundle:
              </p>
              <div className="grid gap-2">
                {bundle.websites.map((website, index) => (
                  <a
                    key={index}
                    href={`https://${website.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted transition-colors group"
                  >
                    <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{website.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{website.url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              <Button onClick={handleSearchWithBundle} size="lg" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search with this Bundle
              </Button>
              
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={handleAddToLibrary}
                  disabled={isAdding || alreadyAdded}
                >
                  {alreadyAdded ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Already in Your Library
                    </>
                  ) : isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to My Library
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Sign in to Add to Library
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={handleCopyLink} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Button variant="link" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Yourel
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
