import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listActivitiesTool from "./tools/list-activities";
import getActivityTool from "./tools/get-activity";
import listBlogPostsTool from "./tools/list-blog-posts";
import getBlogPostTool from "./tools/get-blog-post";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "naturaleza-sin-limites",
  title: "Naturaleza Sin Limites",
  version: "0.1.0",
  instructions:
    "Herramientas de Naturaleza Sin Límites, empresa de deportes de aventura en Andalucía. Usa `list_activities` y `get_activity` para consultar el catálogo de barranquismo, escalada y vías ferratas (fichas técnicas, precios, niveles y temporadas), y `list_blog_posts` / `get_blog_post` para el contenido del blog.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listActivitiesTool, getActivityTool, listBlogPostsTool, getBlogPostTool],
});
