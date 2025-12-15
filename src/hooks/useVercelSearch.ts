import { useState } from "react";

const API_KEY = "AIzaSyByFwruZ-h21A5YUNn6jj9qyBaeHBNgGSQ";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export function useVercelSearch() {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  const [searchEngineId, setSearchEngineId] = useState(() => {
    return localStorage.getItem("google_cse_id") || "";
  });

  const saveSearchEngineId = (id: string) => {
    localStorage.setItem("google_cse_id", id);
    setSearchEngineId(id);
  };

  const search = async (query: string) => {
    if (!searchEngineId) {
      setState({
        results: [],
        isLoading: false,
        error: "Please configure your Google Custom Search Engine ID first.",
        hasSearched: true,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Append site:vercel.app to restrict results to Vercel sites
      const searchQuery = encodeURIComponent(`site:vercel.app ${query}`);
      const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${searchEngineId}&q=${searchQuery}&num=10`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const results: SearchResult[] = (data.items || []).map((item: any) => ({
        title: item.title || "Untitled",
        link: item.link,
        snippet: item.snippet || "",
      }));

      setState({
        results,
        isLoading: false,
        error: null,
        hasSearched: true,
      });
    } catch (error) {
      setState({
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Search failed",
        hasSearched: true,
      });
    }
  };

  return { 
    ...state, 
    search, 
    searchEngineId, 
    saveSearchEngineId,
    needsConfig: !searchEngineId 
  };
}
