import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.1.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");

    if (!resendApiKey || !fromDomain) {
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured. Please add RESEND_API_KEY and RESEND_FROM_DOMAIN to Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { tenant_email, tenant_name, amount, payment_date, payment_method, property_name } = body;

    if (!tenant_email) {
      return new Response(
        JSON.stringify({ success: false, error: "Tenant email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount || 0);
    const formattedDate = payment_date || new Date().toISOString().split("T")[0];

    const { data, error } = await resend.emails.send({
      from: `Rent Receipt <noreply@${fromDomain}>`,
      to: [tenant_email],
      subject: `Rent Payment Receipt — ${property_name || "Your Property"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-family: 'Pacifico', cursive; font-size: 28px; color: #C28A78; margin: 0;">logo</h1>
          </div>

          <div style="background: #FBF9F4; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #94A3B8;">PAYMENT RECEIVED</p>
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #7A9A7E;">${formattedAmount}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #94A3B8; border-bottom: 1px solid #F1F5F9;">Tenant</td>
              <td style="padding: 10px 0; font-size: 14px; color: #3A3F3A; text-align: right; border-bottom: 1px solid #F1F5F9; font-weight: 500;">${tenant_name || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #94A3B8; border-bottom: 1px solid #F1F5F9;">Property</td>
              <td style="padding: 10px 0; font-size: 14px; color: #3A3F3A; text-align: right; border-bottom: 1px solid #F1F5F9; font-weight: 500;">${property_name || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #94A3B8; border-bottom: 1px solid #F1F5F9;">Payment Date</td>
              <td style="padding: 10px 0; font-size: 14px; color: #3A3F3A; text-align: right; border-bottom: 1px solid #F1F5F9; font-weight: 500;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #94A3B8;">Method</td>
              <td style="padding: 10px 0; font-size: 14px; color: #3A3F3A; text-align: right; font-weight: 500;">${payment_method || "—"}</td>
            </tr>
          </table>

          <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #687068;">Thank you for your payment. This is an automated receipt — please keep it for your records.</p>
          </div>

          <p style="margin-top: 24px; font-size: 11px; color: #94A3B8; text-align: center;">
            This email was sent automatically. If you have any questions, please contact your property manager.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend send error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});