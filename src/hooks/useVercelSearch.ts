import { useState } from "react";

const API_KEY = "AIzaSyByFwruZ-h21A5YUNn6jj9qyBaeHBNgGSQ";
const CSE_ID = "c45a3d17b28ad4867";

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

  const search = async (query: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const searchQuery = encodeURIComponent(query);
      const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${searchQuery}&num=10`;

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

  return { ...state, search };
}
