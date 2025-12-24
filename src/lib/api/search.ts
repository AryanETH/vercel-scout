import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  url: string;
  title: string;
  description: string | null;
  platform: string;
  favicon_url: string | null;
  search_score: number;
  tags: string[];
  rank?: number;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  page: number;
  error?: string;
}

interface AISummaryResponse {
  success: boolean;
  summary: string;
  error?: string;
}

interface CrawlResponse {
  success: boolean;
  site?: SearchResult;
  relatedFound?: number;
  error?: string;
}

export const searchApi = {
  // Search indexed sites using PostgreSQL full-text search
  async search(
    query: string,
    platform: string = "all",
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("search", {
        body: { query, platform, page, limit },
      });

      if (error) {
        console.error("Search API error:", error);
        return { success: false, results: [], total: 0, page, error: error.message };
      }

      return data as SearchResponse;
    } catch (err) {
      console.error("Search error:", err);
      return {
        success: false,
        results: [],
        total: 0,
        page,
        error: err instanceof Error ? err.message : "Search failed",
      };
    }
  },

  // Web search (Google-like) powered by Firecrawl
  async webSearch(
    query: string,
    platform: string = "all",
    page: number = 1,
    limit: number = 50
  ): Promise<SearchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("web-search", {
        body: { query, platform, limit },
      });

      if (error) {
        console.error("Web search API error:", error);
        return { success: false, results: [], total: 0, page, error: error.message };
      }

      return data as SearchResponse;
    } catch (err) {
      console.error("Web search error:", err);
      return {
        success: false,
        results: [],
        total: 0,
        page,
        error: err instanceof Error ? err.message : "Web search failed",
      };
    }
  },

  // Get AI-powered summary for search results
  async getAISummary(
    query: string,
    platform: string,
    results: SearchResult[]
  ): Promise<AISummaryResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { query, platform, results },
      });

      if (error) {
        console.error("AI summary error:", error);
        return { success: false, summary: "", error: error.message };
      }

      return data as AISummaryResponse;
    } catch (err) {
      console.error("AI summary error:", err);
      return {
        success: false,
        summary: "",
        error: err instanceof Error ? err.message : "AI failed",
      };
    }
  },

  // Crawl and index a new site
  async crawlSite(url: string, crawlRelated: boolean = false): Promise<CrawlResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("crawl-site", {
        body: { url, crawlRelated },
      });

      if (error) {
        console.error("Crawl error:", error);
        return { success: false, error: error.message };
      }

      return data as CrawlResponse;
    } catch (err) {
      console.error("Crawl error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Crawl failed",
      };
    }
  },

  // Get total indexed sites count
  async getIndexedCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("indexed_sites")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Count error:", error);
        return 0;
      }

      return count || 0;
    } catch {
      return 0;
    }
  },
};
