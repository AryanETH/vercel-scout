import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, platform, page = 1, limit = 20 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Searching for:", query, "platform:", platform, "page:", page);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use PostgreSQL full-text search function
    const { data: results, error: searchError } = await supabase.rpc("search_sites", {
      search_query: query,
      platform_filter: platform === "all" ? null : platform,
      result_limit: limit,
    });

    if (searchError) {
      console.error("Search error:", searchError);
      return new Response(
        JSON.stringify({ success: false, error: searchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log search for analytics
    await supabase.from("search_history").insert({ query, results_count: results?.length || 0 });

    console.log("Found", results?.length || 0, "results");

    return new Response(
      JSON.stringify({
        success: true,
        results: results || [],
        total: results?.length || 0,
        page,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Search failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
