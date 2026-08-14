import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { allActivities } from "../catalog";

export default defineTool({
  name: "get_activity",
  title: "Detalle de actividad",
  description:
    "Devuelve la ficha técnica completa de una actividad del catálogo a partir de su identificador.",
  inputSchema: {
    id: z.string().min(1).describe("Identificador de la actividad, obtenido con list_activities."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const activity = allActivities().find((a) => a.id === id);
    if (!activity) throw new ToolError(`No existe ninguna actividad con id "${id}".`);
    return {
      content: [{ type: "text", text: JSON.stringify(activity, null, 2) }],
      structuredContent: { activity },
    };
  },
});
