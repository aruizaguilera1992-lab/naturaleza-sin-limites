import type { Database } from "../../../src/integrations/supabase/types.ts";

type Functions = Database["public"]["Functions"];
type Confirmation = Functions["confirm_payment_request"];

// PostgreSQL accepts NULL here (the function uses COALESCE and DEFAULT NULL).
// Generated RPC types do not preserve argument nullability. Keep the correction
// local to server callers rather than changing the generated browser schema.
export type ServerDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Functions"> & {
    Functions: Omit<Functions, "confirm_payment_request"> & {
      confirm_payment_request: Omit<Confirmation, "Args"> & {
        Args: Omit<Confirmation["Args"], "_payment_intent_id" | "_customer_email"> & {
          _payment_intent_id: string | null;
          _customer_email?: string | null;
        };
      };
    };
  };
};
