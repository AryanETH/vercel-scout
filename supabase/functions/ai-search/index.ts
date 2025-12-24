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
    const { query, platform, results } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI processing query:", query);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from search results
    const resultsContext = results?.slice(0, 10).map((r: any, i: number) => 
      `${i + 1}. ${r.title} (${r.url}): ${r.description || 'No description'}`
    ).join('\n') || 'No search results available';

    const systemPrompt = `You are Yourel, an intelligent search assistant that helps users discover projects, portfolios, and tools hosted across various platforms like Vercel, GitHub Pages, Netlify, Railway, Render, Bubble, Framer, Replit, Bolt, Fly.io, and Lovable.

Your task is to:
1. Understand the user's search intent
2. Provide a brief, helpful summary of what they might be looking for
3. Suggest refined search terms if the query is vague
4. Highlight the most relevant results from the search

Be concise, helpful, and focus on discovering great projects.`;

    const userPrompt = `User searched for: "${query}"
${platform && platform !== 'all' ? `Filtering by platform: ${platform}` : ''}

Search results found:
${resultsContext}

Provide a brief, helpful response that:
1. Summarizes what the user is looking for (1 sentence)
2. Highlights 2-3 most relevant results with why they're relevant
3. Suggests 1-2 alternative search terms if helpful`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiSummary = data.choices?.[0]?.message?.content || "";

    console.log("AI summary generated");

    return new Response(
      JSON.stringify({ success: true, summary: aiSummary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI search error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "AI failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
