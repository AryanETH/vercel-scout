import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOtpRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOtpRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating OTP for:", email);

    // Generate 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Delete any existing OTPs for this email
    await supabaseAdmin
      .from("otp_codes")
      .delete()
      .eq("email", email.toLowerCase());

    // Store OTP in database
    const { error: dbError } = await supabaseAdmin
      .from("otp_codes")
      .insert({
        email: email.toLowerCase(),
        code,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store OTP");
    }

    // Send email with OTP
    const { error: emailError } = await resend.emails.send({
      from: "YOUREL <onboarding@resend.dev>",
      to: [email],
      subject: "Your YOUREL Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; margin: 0; padding: 40px 20px;">
          <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #333; font-size: 24px; margin: 0 0 20px; text-align: center;">YOUREL</h1>
            <p style="color: #666; font-size: 16px; margin: 0 0 30px; text-align: center;">
              Your verification code is:
            </p>
            <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
            </div>
            <p style="color: #999; font-size: 14px; margin: 0; text-align: center;">
              This code expires in 10 minutes.
            </p>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0; text-align: center;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      // Check if it's a domain verification error
      const errorStr = JSON.stringify(emailError);
      if (errorStr.includes('verify a domain') || errorStr.includes('403')) {
        throw new Error("Email domain not verified. For testing, use the email associated with your Resend account.");
      }
      throw new Error("Failed to send email");
    }

    console.log("OTP sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
