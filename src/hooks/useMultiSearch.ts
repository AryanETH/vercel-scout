import { useState, useCallback } from "react";
import { Platform } from "@/components/PlatformFilters";
import { searchApi, SearchResult as ApiSearchResult } from "@/lib/api/search";

// Legacy Google CSE config (fallback)
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

  // Convert API result to display format
  const convertResult = (r: ApiSearchResult): SearchResult => ({
    title: r.title,
    link: r.url,
    snippet: r.description || "",
    platform: (r.platform as Exclude<Platform, "all">) || "vercel",
    favicon: r.favicon_url || undefined,
  });

  // Fallback to Google CSE when database is empty
  const searchGoogleCSE = async (
    query: string,
    platform: Exclude<Platform, "all"> | null,
    start: number,
    num: number
  ): Promise<{ results: SearchResult[]; total: number }> => {
    let searchQuery = query;
    if (platform) {
      searchQuery = `${query} ${PLATFORM_SITES[platform]}`;
    }
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(searchQuery)}&start=${start}&num=${num}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const results: SearchResult[] = (data.items || []).map((item: any) => {
      // Detect platform from URL
      let detectedPlatform: Exclude<Platform, "all"> = "vercel";
      for (const [p, pattern] of Object.entries(PLATFORM_SITES)) {
        if (item.link?.includes(pattern.replace("site:", ""))) {
          detectedPlatform = p as Exclude<Platform, "all">;
          break;
        }
      }

      return {
        title: item.title || "Untitled",
        link: item.link,
        snippet: item.snippet || "",
        platform: detectedPlatform,
      };
    });

    const total = parseInt(data.searchInformation?.totalResults || "0", 10);
    return { results, total: Math.min(total, MAX_RESULTS) };
  };

  const search = useCallback(
    async (
      query: string,
      platform: Platform = "all",
      page: number = 1,
      favoriteMode: boolean = false
    ) => {
      if (!query.trim()) return;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        aiSummary: null,
        isAILoading: false,
      }));
      setLastQuery(query);
      setLastPlatform(platform);

      try {
        // First, try our indexed database
        const dbResponse = await searchApi.search(query, platform, page, RESULTS_PER_PAGE);

        let allResults: SearchResult[] = [];
        let totalResults = 0;

        if (dbResponse.success && dbResponse.results.length > 0) {
          // Use database results
          allResults = dbResponse.results.map(convertResult);
          totalResults = dbResponse.total;
          console.log("Using database results:", allResults.length);
        } else {
          // Fallback to Google CSE
          console.log("Falling back to Google CSE");
          const startIndex = (page - 1) * 10 + 1;

          if (platform === "all") {
            // Fetch from multiple platforms
            const platforms: Exclude<Platform, "all">[] = [
              "vercel", "github", "netlify", "railway", "onrender",
              "bubble", "framer", "replit", "bolt", "fly", "lovable",
            ];

            const resultsPerPlatform = 1;
            const platformPromises = platforms.map((p) =>
              searchGoogleCSE(query, p, 1, resultsPerPlatform).catch(() => ({
                results: [],
                total: 0,
              }))
            );

            const results = await Promise.all(platformPromises);

            // Interleave results
            const platformResults = results.map((r) => r.results);
            const maxLength = Math.max(...platformResults.map((r) => r.length));

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
            const { results, total } = await searchGoogleCSE(
              query,
              platform,
              startIndex,
              10
            );
            allResults = results;
            totalResults = total;
          }
        }

        // Apply favorites ranking if in favorites mode
        if (favoriteMode) {
          allResults = rankByUserPreferences(allResults);
        }

        setState({
          results: allResults,
          isLoading: false,
          error: null,
          hasSearched: true,
          totalResults,
          currentPage: page,
          aiSummary: null,
          isAILoading: true,
        });

        // Fetch AI summary in background
        if (allResults.length > 0) {
          const aiResponse = await searchApi.getAISummary(
            query,
            platform,
            allResults.map((r) => ({
              id: "",
              url: r.link,
              title: r.title,
              description: r.snippet,
              platform: r.platform,
              favicon_url: r.favicon || null,
              search_score: 0,
              tags: [],
            }))
          );

          if (aiResponse.success) {
            setState((prev) => ({
              ...prev,
              aiSummary: aiResponse.summary,
              isAILoading: false,
            }));
          } else {
            setState((prev) => ({ ...prev, isAILoading: false }));
          }
        } else {
          setState((prev) => ({ ...prev, isAILoading: false }));
        }
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
    []
  );

  // Ranking function based on user preferences
  const rankByUserPreferences = (results: SearchResult[]): SearchResult[] => {
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

    return results.sort((a, b) => {
      const scoreA = (siteLikes[a.link] || 0) - (siteDislikes[a.link] || 0);
      const scoreB = (siteLikes[b.link] || 0) - (siteDislikes[b.link] || 0);
      return scoreB - scoreA;
    });
  };

  const changePage = useCallback(
    (page: number, favoriteMode: boolean = false) => {
      search(lastQuery, lastPlatform, page, favoriteMode);
    },
    [lastQuery, lastPlatform, search]
  );

  const changeFilter = useCallback(
    (platform: Platform, favoriteMode: boolean = false) => {
      search(lastQuery, platform, 1, favoriteMode);
    },
    [lastQuery, search]
  );

  return {
    ...state,
    search,
    changePage,
    changeFilter,
    totalPages: Math.ceil(state.totalResults / RESULTS_PER_PAGE),
  };
}
