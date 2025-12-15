import { useState, useCallback } from "react";
import { Platform } from "@/components/PlatformFilters";

const API_KEY = "AIzaSyByFwruZ-h21A5YUNn6jj9qyBaeHBNgGSQ";
const CSE_ID = "c45a3d17b28ad4867";

const PLATFORM_SITES: Record<Exclude<Platform, "all">, string> = {
  vercel: "site:vercel.app",
  github: "site:github.io",
  onrender: "site:onrender.com",
  netlify: "site:netlify.app",
  railway: "site:railway.app",
  bubble: "site:bubbleapps.io",
  framer: "site:framer.website",
  replit: "site:replit.app",
  bolt: "site:bolt.host",
  fly: "site:fly.dev",
  lovable: "site:lovable.app",
};

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  platform: Exclude<Platform, "all">;
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalResults: number;
  currentPage: number;
}

const RESULTS_PER_PAGE = 10;
const MAX_RESULTS = 100;

export function useMultiSearch() {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
    totalResults: 0,
    currentPage: 1,
  });
  const [lastQuery, setLastQuery] = useState("");
  const [lastPlatform, setLastPlatform] = useState<Platform>("all");

  const searchPlatform = async (
    query: string,
    platform: Exclude<Platform, "all">,
    start: number,
    num: number
  ): Promise<{ results: SearchResult[]; total: number }> => {
    const searchQuery = encodeURIComponent(`${query} ${PLATFORM_SITES[platform]}`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${searchQuery}&start=${start}&num=${num}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const results: SearchResult[] = (data.items || []).map((item: any) => ({
      title: item.title || "Untitled",
      link: item.link,
      snippet: item.snippet || "",
      platform,
    }));

    const total = parseInt(data.searchInformation?.totalResults || "0", 10);
    return { results, total: Math.min(total, MAX_RESULTS) };
  };

  const search = useCallback(async (query: string, platform: Platform = "all", page: number = 1) => {
    if (!query.trim()) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    setLastQuery(query);
    setLastPlatform(platform);

    try {
      let allResults: SearchResult[] = [];
      let totalResults = 0;
      const startIndex = (page - 1) * RESULTS_PER_PAGE + 1;

      if (platform === "all") {
        // For mixed results, fetch from all platforms and interleave
        const platforms: Exclude<Platform, "all">[] = [
          "vercel", "github", "netlify", "railway", "onrender", 
          "bubble", "framer", "replit", "bolt", "fly", "lovable"
        ];
        
        // Fetch fewer results per platform to stay within API limits
        const resultsPerPlatform = Math.max(1, Math.floor(10 / platforms.length));
        const platformPromises = platforms.map((p) =>
          searchPlatform(query, p, 1, resultsPerPlatform).catch(() => ({ results: [], total: 0 }))
        );

        const results = await Promise.all(platformPromises);
        
        // Round-robin interleaving of results from all platforms
        const platformResults = results.map(r => r.results);
        const maxLength = Math.max(...platformResults.map(r => r.length));
        
        for (let i = 0; i < maxLength && allResults.length < 50; i++) {
          for (let j = 0; j < platformResults.length && allResults.length < 50; j++) {
            if (platformResults[j][i]) {
              allResults.push(platformResults[j][i]);
            }
          }
        }

        totalResults = Math.min(
          results.reduce((sum, r) => sum + r.total, 0),
          MAX_RESULTS
        );
      } else {
        const { results, total } = await searchPlatform(query, platform, startIndex, RESULTS_PER_PAGE);
        allResults = results;
        totalResults = total;
      }

      setState({
        results: allResults,
        isLoading: false,
        error: null,
        hasSearched: true,
        totalResults,
        currentPage: page,
      });
    } catch (error) {
      setState({
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Search failed",
        hasSearched: true,
        totalResults: 0,
        currentPage: 1,
      });
    }
  }, []);

  const changePage = useCallback((page: number) => {
    search(lastQuery, lastPlatform, page);
  }, [lastQuery, lastPlatform, search]);

  const changeFilter = useCallback((platform: Platform) => {
    search(lastQuery, platform, 1);
  }, [lastQuery, search]);

  return {
    ...state,
    search,
    changePage,
    changeFilter,
    totalPages: Math.ceil(state.totalResults / RESULTS_PER_PAGE),
  };
}
