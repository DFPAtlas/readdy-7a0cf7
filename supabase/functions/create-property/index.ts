// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PLATFORM_LANDLORD_ID = "de91128d-fa59-4403-baa6-c37e509ef609";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, address, city, postcode, nation } = body;

    if (!name || !address || !city || !postcode) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, address, city, postcode" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SB_SERVICE_ROLE_KEY")!
    );

    const propertyNation = nation || "england";

    const { data, error } = await supabase
      .from("properties")
      .insert({
        line1: address,
        city: city,
        postcode: postcode,
        nation: propertyNation,
        landlord_id: PLATFORM_LANDLORD_ID,
        is_hmo: false,
        is_furnished: false,
      })
      .select("id")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ id: data.id, name, address: `${address}, ${city}, ${postcode}` }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
