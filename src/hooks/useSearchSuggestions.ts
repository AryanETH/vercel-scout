import { useState, useEffect, useCallback } from 'react';

const API_KEY = 'AIzaSyByFwruZ-h21A5YUNn6jj9qyBaeHBNgGSQ';

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
      // Use Google's autocomplete API via a CORS proxy or fallback to static suggestions
      const response = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data[1]?.slice(0, 8) || []);
      }
    } catch (error) {
      // Fallback to generated suggestions based on query
      const platformSuggestions = generateFallbackSuggestions(searchQuery);
      setSuggestions(platformSuggestions);
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
