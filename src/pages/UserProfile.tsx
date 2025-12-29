import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, User, ArrowLeft, Loader2, Package, Globe, Copy, Search, Plus, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { BundleWebsite } from '@/hooks/useBundles';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface ProfileData {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface FavoriteData {
  id: string;
  url: string;
  name: string;
  created_at: string;
}

interface BundleData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  websites: BundleWebsite[];
  user_id: string;
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bundleId = searchParams.get('bundle');
  const { user, isAuthenticated } = useSupabaseAuth();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [alreadyAdded, setAlreadyAdded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // If bundle ID is provided, fetch the bundle using Edge Function (bypasses RLS)
      if (bundleId) {
        try {
          const { data, error } = await supabase.functions.invoke('get-shared-bundle', {
            body: { bundleId }
          });

          if (!error && data?.success && data?.bundle) {
            const bundleData = data.bundle;
            setBundle(bundleData);
            
            if (data.owner) {
              setProfile(data.owner);
            }
            
            // Check if current user already has this bundle
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
            return;
          }
        } catch (err) {
          console.error('Error fetching bundle:', err);
        }
        
        // If Edge Function fails, show not found
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (profileError || !profileData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch user's favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      setFavorites(favoritesData || []);
      setIsLoading(false);
    };

    fetchData();
  }, [username, bundleId, user]);

  const handleCopyBundleLink = () => {
    const url = window.location.href;
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

  // Show bundle view if bundle is loaded
  if (bundle) {
    const ownerName = profile?.full_name || profile?.username || 'Someone';
    
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
                <span>Shared Bundle by {ownerName}</span>
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

                <Button variant="ghost" size="sm" onClick={handleCopyBundleLink} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Share Link
                </Button>
              </div>
            </CardContent>
          </Card>

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

  if (notFound) {
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
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {bundleId ? "This bundle doesn't exist or has been deleted." : `The user @${username} doesn't exist.`}
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

  const displayName = profile?.full_name || profile?.username || 'User';
  const initials = displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-4 md:px-12 border-b border-border">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5C82F4] to-[#8243ED] flex items-center justify-center text-white font-bold text-2xl">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">@{profile?.username}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Favorite Sites ({favorites.length})
          </h2>

          {favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No favorites yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => {
                const displayUrl = favorite.url.replace(/^https?:\/\//, "").split("/")[0];
                return (
                  <a
                    key={favorite.id}
                    href={favorite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {favorite.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{displayUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-center">
          <Button variant="outline" asChild>
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
