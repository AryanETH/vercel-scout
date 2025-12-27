import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOtpRequest {
  email: string;
  code: string;
  fullName?: string;
  username?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, fullName, username }: VerifyOtpRequest = await req.json();
    
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying OTP for:", email);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check for valid OTP
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error("Failed to verify OTP");
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let user;
    let session;

    if (existingUser) {
      // User exists - generate a session for them
      console.log("Existing user found, generating session");
      
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email.toLowerCase(),
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        throw new Error("Failed to sign in");
      }

      // Use the token to create a session
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email.toLowerCase(),
        options: {
          redirectTo: `${req.headers.get('origin') || 'https://yourel.app'}/`,
        }
      });

      user = existingUser;
      
      // Return user data and indicate they need to complete auth via magic link token
      return new Response(
        JSON.stringify({ 
          success: true,
          user: { id: user.id, email: user.email },
          action_url: sessionData?.properties?.action_link,
          message: "User verified"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Create new user
      console.log("Creating new user");
      
      const tempPassword = crypto.randomUUID();
      
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true,
        password: tempPassword,
        user_metadata: {
          full_name: fullName || '',
          username: username || '',
        }
      });

      if (createError) {
        console.error("Create user error:", createError);
        throw new Error("Failed to create user");
      }

      user = createData.user;

      // Update profile with username
      if (username && user) {
        await supabaseAdmin
          .from("profiles")
          .update({ username: username.toLowerCase(), full_name: fullName })
          .eq("id", user.id);
      }

      // Generate magic link for auto-login
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email.toLowerCase(),
        options: {
          redirectTo: `${req.headers.get('origin') || 'https://yourel.app'}/`,
        }
      });

      if (linkError) {
        console.error("Link generation error:", linkError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          user: { id: user.id, email: user.email },
          action_url: linkData?.properties?.action_link,
          message: "Account created successfully"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify OTP" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
