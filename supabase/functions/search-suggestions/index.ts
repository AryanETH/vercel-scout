const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: true, suggestions: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQuery = query.trim();
    console.log("Fetching suggestions for:", searchQuery);

    // Try Google Suggest API
    try {
      const googleResponse = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (googleResponse.ok) {
        const data = await googleResponse.json();
        const suggestions = (data[1] || []).slice(0, 8);
        console.log("Got", suggestions.length, "suggestions from Google");
        
        return new Response(
          JSON.stringify({ success: true, suggestions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (googleError) {
      console.warn("Google suggest failed, using fallback:", googleError);
    }

    // Fallback: Generate smart suggestions
    const fallbackSuggestions = generateSmartSuggestions(searchQuery);
    
    return new Response(
      JSON.stringify({ success: true, suggestions: fallbackSuggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("search-suggestions error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Failed to get suggestions" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateSmartSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  const suggestions: string[] = [];

  // Tech/web development related suggestions
  const techTerms = [
    "portfolio", "dashboard", "landing page", "blog", "e-commerce", 
    "saas", "template", "starter kit", "website", "web app",
    "react", "nextjs", "tailwind", "typescript", "api",
    "ui kit", "design system", "component library", "admin panel"
  ];

  // Platform-specific suggestions
  const platformTerms = [
    "vercel app", "github project", "netlify site", "railway deployment",
    "replit project", "framer website", "lovable app"
  ];

  // Add relevant tech terms
  for (const term of techTerms) {
    if (term.startsWith(q) || q.includes(term.substring(0, 3))) {
      suggestions.push(term);
    }
    if (suggestions.length < 8) {
      suggestions.push(`${query} ${term}`);
    }
  }

  // Add platform-specific if query seems platform-related
  for (const term of platformTerms) {
    if (term.includes(q)) {
      suggestions.push(term);
    }
  }

  // Remove duplicates and limit
  const unique = [...new Set(suggestions)].filter(s => s !== query);
  return unique.slice(0, 8);
}
