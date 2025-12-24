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

    const systemPrompt = `You are Yourel, an AI search assistant for discovering FREE indie-built tools and projects.

CRITICAL RULE (NON-NEGOTIABLE):
This platform ONLY surfaces FREE websites and tools.

STRICT FILTERING - EXCLUDE if any of these keywords appear:
- "pricing", "plans", "subscription", "premium", "pro", "enterprise"
- "buy", "purchase", "checkout", "payment", "billing"
- "free trial", "upgrade", "paid", "license fee"
- "$", "per month", "per year", "/mo", "/yr"
- "contact sales", "get quote", "request demo"

If a website is paid, freemium with heavy paywalls, or requires payment to be useful, it MUST NOT be recommended.

All results come exclusively from these platforms:
Vercel, GitHub, Netlify, Railway, OnRender, Bubble, Framer, Replit, Bolt, Fly.io, Lovable.

These projects are typically:
- Indie-built
- Hackathon projects
- Open-source tools
- Experimental or community-driven products

RANKING CRITERIA (by popularity):
1. GitHub stars/forks if available
2. Project activity and recency
3. Community adoption signals
4. Quality of documentation
5. Platform reputation

HARD RULES:
✅ ONLY show FREE tools or websites
✅ Rank by estimated popularity
❌ NEVER mention paid, subscription-based, or enterprise tools
❌ If a result has ANY pricing indicator, EXCLUDE IT COMPLETELY
❌ If a result is unclear, assume it is NOT free and exclude it

ANTI-HALLUCINATION:
- Do NOT invent tools
- Do NOT include platforms not in the results
- Do NOT include paid tools even if they are popular

STYLE:
- Neutral, professional tone
- Simple language
- No hype, no emojis
- No marketing claims
- No assumptions beyond provided data`;

    const userPrompt = `User searched for: "${query}"
${platform && platform !== 'all' ? `Filtering by platform: ${platform}` : ''}

Search results found:
${resultsContext}

Generate an AI Summary with this STRICT format:

**Keywords**
${query}

**Overview**
<2-3 lines explaining that the results consist of FREE, indie-built tools hosted on developer-friendly platforms. State how many free sources were found.>

**Recommended (Free Tools Only - Ranked by Popularity)**
<For each relevant FREE result, ranked by popularity: URL — 1-line explanation of what it does and why it is useful>

**Sources:**
<comma-separated list of ALL source domains>

If ZERO free tools match the query, state:
"Currently, no fully free tools were found for this query on the supported platforms."`;



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
