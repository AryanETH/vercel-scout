import { useState, useCallback } from "react";
import { Platform } from "@/components/PlatformFilters";
import { searchApi, SearchResult as ApiSearchResult } from "@/lib/api/search";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  platform?: string;
  favicon?: string;
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalResults: number;
  currentPage: number;
  aiSummary: string | null;
  isAILoading: boolean;
}

const RESULTS_PER_PAGE = 20;
const MAX_RESULTS = 100;

function toDisplayResult(r: ApiSearchResult): SearchResult {
  return {
    title: r.title,
    link: r.url,
    snippet: r.description || "",
    platform: r.platform || undefined,
    favicon: r.favicon_url || undefined,
  };
}

function toApiResult(r: SearchResult, fallbackPlatform: string): ApiSearchResult {
  return {
    id: r.link,
    url: r.link,
    title: r.title,
    description: r.snippet,
    platform: r.platform || fallbackPlatform,
    favicon_url: r.favicon || null,
    search_score: 0,
    tags: [],
  };
}

function rankByUserPreferences(results: SearchResult[]): SearchResult[] {
  const allUsers = JSON.parse(localStorage.getItem("yourel_users") || "[]");
  const siteLikes: Record<string, number> = {};
  const siteDislikes: Record<string, number> = {};

  allUsers.forEach((user: any) => {
    user.likedSites?.forEach((site: string) => {
      siteLikes[site] = (siteLikes[site] || 0) + 1;
    });
    user.dislikedSites?.forEach((site: string) => {
      siteDislikes[site] = (siteDislikes[site] || 0) + 1;
    });
  });

  return [...results].sort((a, b) => {
    const scoreA = (siteLikes[a.link] || 0) - (siteDislikes[a.link] || 0);
    const scoreB = (siteLikes[b.link] || 0) - (siteDislikes[b.link] || 0);
    return scoreB - scoreA;
  });
}

function slicePage(results: SearchResult[], page: number): SearchResult[] {
  const start = (page - 1) * RESULTS_PER_PAGE;
  return results.slice(start, start + RESULTS_PER_PAGE);
}

export function useMultiSearch() {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
    totalResults: 0,
    currentPage: 1,
    aiSummary: null,
    isAILoading: false,
  });

  const [lastQuery, setLastQuery] = useState("");
  const [lastPlatform, setLastPlatform] = useState<Platform>("all");
  const [lastBundleSiteFilters, setLastBundleSiteFilters] = useState<string | null>(null);

  // Cache full result set so pagination doesn't re-hit the network
  const [fullResultsKey, setFullResultsKey] = useState("");
  const [fullResults, setFullResults] = useState<SearchResult[]>([]);

  const runAISummary = useCallback(async (query: string, platform: Platform, pageResults: SearchResult[]) => {
    if (pageResults.length === 0) {
      setState((prev) => ({ ...prev, aiSummary: null, isAILoading: false }));
      return;
    }

    try {
      const aiResponse = await searchApi.getAISummary(
        query,
        platform,
        pageResults.map((r) => toApiResult(r, platform === "all" ? "web" : platform))
      );

      if (aiResponse.success) {
        setState((prev) => ({ ...prev, aiSummary: aiResponse.summary, isAILoading: false }));
      } else {
        setState((prev) => ({ ...prev, isAILoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isAILoading: false }));
    }
  }, []);

  const search = useCallback(
    async (
      query: string,
      platform: Platform = "all",
      page: number = 1,
      favoriteMode: boolean = false,
      bundleSiteFilters?: string | null
    ) => {
      if (!query.trim()) return;

      const effectivePlatform: Platform = bundleSiteFilters ? "all" : platform;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        aiSummary: null,
        isAILoading: false,
      }));

      setLastQuery(query);
      setLastPlatform(effectivePlatform);
      setLastBundleSiteFilters(bundleSiteFilters ?? null);

      const key = `${query}::${effectivePlatform}::${favoriteMode ? "fav" : "all"}::${bundleSiteFilters || "none"}`;

      try {
        let computedFullResults = fullResults;

        if (key !== fullResultsKey) {
          const webResponse = await searchApi.webSearch(
            query,
            effectivePlatform,
            1,
            MAX_RESULTS,
            bundleSiteFilters
          );

          if (!webResponse.success) {
            throw new Error(webResponse.error || "Search failed");
          }

          computedFullResults = webResponse.results.map(toDisplayResult);
          if (favoriteMode) {
            computedFullResults = rankByUserPreferences(computedFullResults);
          }

          setFullResultsKey(key);
          setFullResults(computedFullResults);
        }

        const pageResults = slicePage(computedFullResults, page);

        setState({
          results: pageResults,
          isLoading: false,
          error: null,
          hasSearched: true,
          totalResults: computedFullResults.length,
          currentPage: page,
          aiSummary: null,
          isAILoading: pageResults.length > 0,
        });

        // Fetch AI summary in background
        await runAISummary(query, effectivePlatform, pageResults);
      } catch (error) {
        setState({
          results: [],
          isLoading: false,
          error: error instanceof Error ? error.message : "Search failed",
          hasSearched: true,
          totalResults: 0,
          currentPage: 1,
          aiSummary: null,
          isAILoading: false,
        });
      }
    },
    [fullResults, fullResultsKey, runAISummary]
  );

  const changePage = useCallback(
    (page: number, favoriteMode: boolean = false) => {
      search(lastQuery, lastPlatform, page, favoriteMode, lastBundleSiteFilters);
    },
    [lastBundleSiteFilters, lastPlatform, lastQuery, search]
  );

  const changeFilter = useCallback(
    (platform: Platform, favoriteMode: boolean = false) => {
      if (lastBundleSiteFilters) {
        search(lastQuery, "all", 1, favoriteMode, lastBundleSiteFilters);
        return;
      }
      search(lastQuery, platform, 1, favoriteMode);
    },
    [lastBundleSiteFilters, lastQuery, search]
  );

  return {
    ...state,
    search,
    changePage,
    changeFilter,
    totalPages: Math.ceil(state.totalResults / RESULTS_PER_PAGE) || 1,
  };
}
