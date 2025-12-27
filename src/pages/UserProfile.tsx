import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, User, ArrowLeft, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

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

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
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

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The user @{username} doesn't exist or hasn't set up their profile yet.
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
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5C82F4] to-[#8243ED] flex items-center justify-center text-white font-bold text-2xl">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">@{profile?.username}</p>
          </div>
        </div>

        {/* Favorites Section */}
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

        {/* Back Link */}
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
