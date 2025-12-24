import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_SITES: Record<string, string> = {
  vercel: "site:vercel.app",
  github: "site:github.io",
  netlify: "site:netlify.app",
  railway: "site:railway.app",
  onrender: "site:onrender.com",
  bubble: "site:bubbleapps.io",
  framer: "site:framer.website",
  replit: "site:replit.app",
  bolt: "site:bolt.host",
  fly: "site:fly.dev",
  lovable: "site:lovable.app",
};

function detectPlatform(url: string): string {
  const platformPatterns: Record<string, RegExp> = {
    vercel: /\.vercel\.app/i,
    github: /\.github\.io/i,
    netlify: /\.netlify\.app/i,
    railway: /\.railway\.app/i,
    onrender: /\.onrender\.com/i,
    bubble: /\.bubbleapps\.io/i,
    framer: /\.framer\.website/i,
    replit: /\.replit\.app/i,
    bolt: /\.bolt\.host/i,
    fly: /\.fly\.dev/i,
    lovable: /\.lovable\.app/i,
  };

  for (const [platform, pattern] of Object.entries(platformPatterns)) {
    if (pattern.test(url)) return platform;
  }
  return "web";
}

function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, platform = "all", limit = 50 } = await req.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return new Response(JSON.stringify({ success: false, error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(JSON.stringify({ success: false, error: "Web search is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    let effectiveQuery = query.trim();
    if (platform && platform !== "all" && PLATFORM_SITES[String(platform)]) {
      effectiveQuery = `${effectiveQuery} ${PLATFORM_SITES[String(platform)]}`;
    }

    console.log("Web searching:", { query, platform, effectiveQuery, limit: normalizedLimit });

    const firecrawlResp = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: effectiveQuery,
        limit: normalizedLimit,
      }),
    });

    const firecrawlJson = await firecrawlResp.json();

    if (!firecrawlResp.ok || !firecrawlJson?.success) {
      console.error("Firecrawl search error:", firecrawlResp.status, firecrawlJson);
      return new Response(JSON.stringify({ success: false, error: firecrawlJson?.error || "Search failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const list = Array.isArray(firecrawlJson.data)
      ? firecrawlJson.data
      : Array.isArray(firecrawlJson.data?.data)
        ? firecrawlJson.data.data
        : [];

    const results = list
      .filter((r: any) => r?.url)
      .map((r: any) => {
        const url = String(r.url);
        const detectedPlatform = platform && platform !== "all" ? String(platform) : detectPlatform(url);
        return {
          id: url,
          url,
          title: String(r.title || new URL(url).hostname),
          description: r.description ? String(r.description) : null,
          platform: detectedPlatform,
          favicon_url: faviconFor(url) || null,
          search_score: 0,
          tags: [],
        };
      });

    // Log for basic analytics
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("search_history").insert({ query, results_count: results.length });
    } catch (e) {
      console.warn("Failed to log search_history:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        total: results.length,
        page: 1,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("web-search error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Search failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
