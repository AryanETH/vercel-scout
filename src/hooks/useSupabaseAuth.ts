import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FavoriteItem {
  id: string;
  url: string;
  name: string;
  created_at: string;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setFavorites(data);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile and favorites fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchFavorites(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setFavorites([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchFavorites(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchFavorites]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  const sendMagicLink = async (email: string, fullName?: string, username?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
          username: username || ''
        }
      }
    });
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string, username?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
          username: username || ''
        }
      }
    });

    // Update username in profile after signup
    if (!error && data.user && username) {
      await supabase
        .from('profiles')
        .update({ username })
        .eq('id', data.user.id);
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setFavorites([]);
    }
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (!error && data) {
      setProfile(data);
    }
    
    return { data, error };
  };

  const addToFavorites = async (url: string, name: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase
      .from('favorites')
      .upsert({ 
        user_id: user.id, 
        url, 
        name 
      }, { 
        onConflict: 'user_id,url' 
      })
      .select()
      .single();
    
    if (!error && data) {
      setFavorites(prev => {
        const filtered = prev.filter(f => f.url !== url);
        return [data, ...filtered];
      });
    }
    
    return { data, error };
  };

  const removeFromFavorites = async (url: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('url', url);
    
    if (!error) {
      setFavorites(prev => prev.filter(f => f.url !== url));
    }
    
    return { error };
  };

  return {
    user,
    session,
    profile,
    favorites,
    isLoading,
    isAuthenticated: !!session,
    signUp,
    sendMagicLink,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
    addToFavorites,
    removeFromFavorites
  };
}
