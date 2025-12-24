import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Platform detection based on URL
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
    if (pattern.test(url)) {
      return platform;
    }
  }
  return "other";
}

// Extract main content from markdown
function extractDescription(markdown: string, maxLength: number = 300): string {
  // Remove markdown syntax
  let text = markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*|__/g, '') // Remove bold
    .replace(/\*|_/g, '') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/\n{2,}/g, ' ') // Replace multiple newlines
    .replace(/\n/g, ' ')
    .trim();

  // Get first meaningful sentences
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    const lastPeriod = text.lastIndexOf('.');
    if (lastPeriod > maxLength / 2) {
      text = text.substring(0, lastPeriod + 1);
    } else {
      text = text + '...';
    }
  }

  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, crawlRelated = false } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Crawling URL:", url);

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Scrape the page
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "links"],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error("Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || "Failed to crawl site" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pageData = scrapeData.data || scrapeData;
    const title = pageData.metadata?.title || new URL(formattedUrl).hostname;
    const description = extractDescription(pageData.markdown || "");
    const platform = detectPlatform(formattedUrl);
    const content = (pageData.markdown || "").substring(0, 5000); // Limit content size
    const favicon = pageData.metadata?.favicon || `https://www.google.com/s2/favicons?domain=${new URL(formattedUrl).hostname}&sz=64`;

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: insertedSite, error: insertError } = await supabase
      .from("indexed_sites")
      .upsert(
        {
          url: formattedUrl,
          title,
          description,
          content,
          platform,
          favicon_url: favicon,
          search_score: 1,
          metadata: pageData.metadata || {},
        },
        { onConflict: "url" }
      )
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Site indexed:", title);

    // Optionally crawl related links from the same platform
    let relatedCrawled = 0;
    if (crawlRelated && pageData.links) {
      const relatedLinks = pageData.links
        .filter((link: string) => detectPlatform(link) === platform && link !== formattedUrl)
        .slice(0, 5);

      for (const link of relatedLinks) {
        try {
          // Check if already indexed
          const { data: existing } = await supabase
            .from("indexed_sites")
            .select("id")
            .eq("url", link)
            .single();

          if (!existing) {
            // Queue for crawling (simplified - just insert placeholder)
            console.log("Found related link:", link);
            relatedCrawled++;
          }
        } catch {
          // Ignore errors for related links
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        site: insertedSite,
        relatedFound: relatedCrawled,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Crawl error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Crawl failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
