import { createClient } from "npm:@supabase/supabase-js@2";
import { handleLead } from "./handler.ts";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const res = await handleLead(req, Deno.env.get("PREAPERTURA_FORWARD_SECRET"), async (row) => {
    const { error } = await supabase.from("contact_submissions").insert(row);
    return { error };
  });
  console.log("preapertura-lead", req.method, res.status);
  return res;
});
