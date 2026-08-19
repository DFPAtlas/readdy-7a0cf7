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
    const { tenant_email, tenant_name, property_name, arrears_amount, arrears_months, message } = body;

    if (!tenant_email) {
      return new Response(
        JSON.stringify({ success: false, error: "Tenant email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(arrears_amount || 0);
    const monthsText = arrears_months === 1 ? "1 month" : `${arrears_months} months`;

    const { data, error } = await resend.emails.send({
      from: `Rent Reminders <noreply@${fromDomain}>`,
      to: [tenant_email],
      subject: `Rent Reminder — ${property_name || "Your Property"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-family: 'Pacifico', cursive; font-size: 28px; color: #C28A78; margin: 0;">logo</h1>
          </div>

          <div style="background: #FEF3C7; border-radius: 10px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #92400E;">OUTSTANDING RENT</p>
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #92400E;">${formattedAmount}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #B45309;">${monthsText} overdue</p>
          </div>

          <div style="background: #FBF9F4; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #3A3F3A; font-weight: 500;">Dear ${tenant_name || "Tenant"},</p>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #687068; line-height: 1.6;">${message || "This is a friendly reminder that your rent payment is currently overdue. Please arrange payment at your earliest convenience."}</p>
            <p style="margin: 0; font-size: 13px; color: #687068;">If you have already made the payment, please disregard this notice. If you are experiencing financial difficulties, please contact us to discuss your options.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #94A3B8; border-bottom: 1px solid #F1F5F9;">Property</td>
              <td style="padding: 10px 0; font-size: 14px; color: #3A3F3A; text-align: right; border-bottom: 1px solid #F1F5F9; font-weight: 500;">${property_name || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #94A3B8; border-bottom: 1px solid #F1F5F9;">Amount Outstanding</td>
              <td style="padding: 10px 0; font-size: 14px; color: #C46868; text-align: right; border-bottom: 1px solid #F1F5F9; font-weight: 600;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #94A3B8;">Period Overdue</td>
              <td style="padding: 10px 0; font-size: 14px; color: #3A3F3A; text-align: right; font-weight: 500;">${monthsText}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="#" style="display: inline-block; padding: 12px 28px; background: #C28A78; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Make a Payment</a>
          </div>

          <p style="margin: 0; font-size: 11px; color: #94A3B8; text-align: center;">
            This is an automated reminder. If you have any questions, please contact your property manager directly.
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
