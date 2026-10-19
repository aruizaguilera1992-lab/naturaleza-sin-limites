import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { PUBLIC_CLOUD_CONFIG, jwtRole } from "./config/publicCloudConfig";

const PUBLIC_KEYS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
  // Explicit env values always win; the public fallback is never used in test mode
  // so isolated tests are not silently connected to Cloud.
  const useFallback = mode !== "test";
  const resolved: Record<string, string | undefined> = {};
  for (const key of PUBLIC_KEYS) {
    resolved[key] = env[key] || (useFallback ? PUBLIC_CLOUD_CONFIG[key] : undefined);
  }

  if (command === "build" && mode === "production") {
    for (const key of PUBLIC_KEYS) {
      if (!resolved[key]) throw new Error(`[build] Missing ${key}: refusing to build a bundle without public Cloud config.`);
    }
    const role = jwtRole(resolved.VITE_SUPABASE_PUBLISHABLE_KEY!);
    const isPublishableFormat = resolved.VITE_SUPABASE_PUBLISHABLE_KEY!.startsWith("sb_publishable_");
    if (!isPublishableFormat && role !== "anon") {
      throw new Error("[build] VITE_SUPABASE_PUBLISHABLE_KEY is not a public anon/publishable key.");
    }
  }

  const define: Record<string, string> = {};
  for (const key of PUBLIC_KEYS) {
    if (resolved[key]) define[`import.meta.env.${key}`] = JSON.stringify(resolved[key]);
  }

  return {
    server: {
      host: "127.0.0.1",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    preview: { host: "127.0.0.1" },
    define,
    plugins: [react(), mcpPlugin(), mode === "development" && componentTagger()].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
