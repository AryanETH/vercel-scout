import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-suggestions', {
        body: { query: searchQuery },
      });

      if (error) {
        console.warn('Suggestions API error:', error);
        setSuggestions(generateFallbackSuggestions(searchQuery));
      } else if (data?.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions.slice(0, 8));
      } else {
        setSuggestions(generateFallbackSuggestions(searchQuery));
      }
    } catch (error) {
      console.warn('Failed to fetch suggestions:', error);
      setSuggestions(generateFallbackSuggestions(searchQuery));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [query, fetchSuggestions]);

  return { suggestions, isLoading };
}

function generateFallbackSuggestions(query: string): string[] {
  const commonTerms = [
    'portfolio',
    'dashboard',
    'landing page',
    'blog',
    'e-commerce',
    'saas',
    'template',
    'starter',
    'app',
    'website',
    'design',
    'project',
    'demo',
    'example'
  ];

  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Add query + common terms
  commonTerms.forEach(term => {
    if (term.includes(lowerQuery) || lowerQuery.includes(term.substring(0, 3))) {
      suggestions.push(`${query} ${term}`);
    }
  });

  // If few matches, add generic suggestions
  if (suggestions.length < 5) {
    suggestions.push(`${query} portfolio`);
    suggestions.push(`${query} template`);
    suggestions.push(`${query} dashboard`);
    suggestions.push(`${query} website`);
    suggestions.push(`${query} app`);
  }

  // Remove duplicates and return
  return [...new Set(suggestions)].slice(0, 8);
}
