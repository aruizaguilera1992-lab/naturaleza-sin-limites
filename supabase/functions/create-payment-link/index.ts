import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCreatePaymentLink } from "./handler.ts";

Deno.serve((req) =>
  handleCreatePaymentLink(req, {
    db: createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
  })
);
