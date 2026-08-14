import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { allActivities, toSummary } from "../catalog";

export default defineTool({
  name: "list_activities",
  title: "Listar actividades",
  description:
    "Lista el catálogo de actividades de aventura (barranquismo, escalada y vías ferratas) con filtros opcionales por tipo, provincia, texto y precio máximo.",
  inputSchema: {
    type: z
      .enum(["barranquismo", "escalada", "ferrata"])
      .optional()
      .describe("Tipo de actividad a filtrar."),
    province: z.string().optional().describe("Provincia, p. ej. 'Málaga'."),
    search: z.string().optional().describe("Texto libre a buscar en nombre, zona o descripción."),
    maxPrice: z.number().positive().optional().describe("Precio máximo por persona en euros."),
    limit: z.number().int().min(1).max(100).default(25).describe("Número máximo de resultados."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ type, province, search, maxPrice, limit }) => {
    const q = search?.toLowerCase().trim();
    const results = allActivities()
      .filter((a) => (type ? a.type === type : true))
      .filter((a) => (province ? a.provincia.toLowerCase() === province.toLowerCase() : true))
      .filter((a) =>
        q
          ? `${a.nombre} ${a.zona} ${a.descripcion} ${a.descripcionLarga}`.toLowerCase().includes(q)
          : true,
      )
      .filter((a) => {
        if (maxPrice == null) return true;
        const value = Number(a.precio.match(/\d+/)?.[0] ?? 0);
        return value > 0 && value <= maxPrice;
      })
      .slice(0, limit)
      .map(toSummary);

    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { count: results.length, activities: results },
    };
  },
});
