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
    const { bundleId } = await req.json();

    if (!bundleId) {
      return new Response(
        JSON.stringify({ success: false, error: "Bundle ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the bundle
    const { data: bundle, error: bundleError } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", bundleId)
      .maybeSingle();

    if (bundleError || !bundle) {
      return new Response(
        JSON.stringify({ success: false, error: "Bundle not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch owner's profile
    let ownerProfile = null;
    if (bundle.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .eq("id", bundle.user_id)
        .maybeSingle();
      ownerProfile = profile;
    }

    // Parse websites if it's a string
    const websites = typeof bundle.websites === "string"
      ? JSON.parse(bundle.websites)
      : bundle.websites || [];

    return new Response(
      JSON.stringify({
        success: true,
        bundle: { ...bundle, websites },
        owner: ownerProfile,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching shared bundle:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch bundle" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
