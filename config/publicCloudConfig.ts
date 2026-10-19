// PUBLIC browser configuration for Lovable Cloud (project URL + anon/publishable key).
// These values are designed to ship in the client bundle; data is protected by RLS.
// Never add service_role keys or any server secret here.
export const PUBLIC_CLOUD_CONFIG = {
  VITE_SUPABASE_URL: "https://aefoevrwckdifmzkrgrm.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlZm9ldnJ3Y2tkaWZtemtyZ3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDgzMTUsImV4cCI6MjA4NDU4NDMxNX0.d4CHOvzVvG4GiCBn-YXNP19ePxDv9RhvL53mLbjSamY",
  // Stripe PUBLISHABLE key (pk_live_…): safe for the browser by design.
  VITE_PAYMENTS_CLIENT_TOKEN: "pk_live_51UBVvgBBmzYywH1eeGFXArEzxVeKTbySQR8WWNfOa3wX0prDZK3koM3M69KUB5fDWTHugbNGs30tV1ONI94C9IfZ00OFi499yJ",
} as const;

/** Returns the JWT "role" claim, or null when it cannot be decoded. */
export function jwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
