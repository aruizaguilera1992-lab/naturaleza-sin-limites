import { barrancos } from "@/data/barrancos";
import { crags } from "@/data/crags";
import { ferratas } from "@/data/ferratas";

export type ActivityType = "barranquismo" | "escalada" | "ferrata";

export interface CatalogItem {
  id: string;
  type: ActivityType;
  nombre: string;
  provincia: string;
  zona: string;
  nivel: string;
  duracion: string;
  precio: string;
  descripcion: string;
  mejorEpoca: string;
  url: string;
}

export interface CatalogDetail extends CatalogItem {
  descripcionLarga: string;
  caracteristicas: string[];
  materialIncluido: boolean;
  grupoMinimo: number;
  datosTecnicos: Record<string, unknown>;
}

function fromBarranco(b: (typeof barrancos)[number]): CatalogDetail {
  return {
    id: b.id,
    type: "barranquismo",
    nombre: b.nombre,
    provincia: b.provincia,
    zona: b.poblacion,
    nivel: `${b.nivel} (${b.nivelExperiencia})`,
    duracion: b.duracion,
    precio: b.precio,
    descripcion: b.descripcionCorta,
    mejorEpoca: b.mejorEpoca,
    url: b.urlInfo,
    descripcionLarga: b.descripcionLarga,
    caracteristicas: b.caracteristicas,
    materialIncluido: b.materialIncluido,
    grupoMinimo: b.grupoMinimo,
    datosTecnicos: {
      clasificacionTecnica: b.clasificacionTecnica,
      desnivel: b.desnivel,
      longitud: b.longitud,
      rapelMaximo: b.rapelMaximo,
      numRapeles: b.numRapeles,
      caudal: b.caudal,
      acceso: b.acceso,
      requisitos: b.requisitos,
      incluye: b.incluye,
      regulacion: b.regulacion,
    },
  };
}

function fromCrag(c: (typeof crags)[number]): CatalogDetail {
  return {
    id: c.id,
    type: "escalada",
    nombre: c.nombre,
    provincia: c.provincia,
    zona: c.zona,
    nivel: c.nivel,
    duracion: c.duracion,
    precio: c.precio,
    descripcion: c.descripcionCorta,
    mejorEpoca: c.mejorEpoca,
    url: c.urlInfo,
    descripcionLarga: c.descripcionLarga,
    caracteristicas: c.caracteristicas,
    materialIncluido: c.materialIncluido,
    grupoMinimo: c.grupoMinimo,
    datosTecnicos: {
      tipo: c.tipo,
      gradoMinimo: c.gradoMinimo,
      gradoMaximo: c.gradoMaximo,
      numeroVias: c.numeroVias,
      tipoEscalada: c.tipoEscalada,
      orientacion: c.orientacion,
      altura: c.altura,
      aproximacion: c.aproximacion,
      acceso: c.acceso,
      coordenadas: c.coordenadas,
      requisitos: c.requisitos,
      incluye: c.incluye,
      destacados: c.destacados,
    },
  };
}

function fromFerrata(f: (typeof ferratas)[number]): CatalogDetail {
  return {
    id: f.id,
    type: "ferrata",
    nombre: f.nombre,
    provincia: f.provincia,
    zona: f.zona,
    nivel: `${f.clasificacion} (${f.dificultad})`,
    duracion: f.duracion,
    precio: f.precio,
    descripcion: f.descripcionCorta,
    mejorEpoca: f.mejorEpoca,
    url: f.urlInfo,
    descripcionLarga: f.descripcionLarga,
    caracteristicas: f.caracteristicas,
    materialIncluido: f.materialIncluido,
    grupoMinimo: f.grupoMinimo,
    datosTecnicos: {
      tipo: f.tipo,
      desnivel: f.desnivel,
      desarrollo: f.desarrollo,
      alturaMaxima: f.alturaMaxima,
      exposicion: f.exposicion,
      aproximacion: f.aproximacion,
      grupoMaximo: f.grupoMaximo,
      reservaObligatoria: f.reservaObligatoria,
      acceso: f.acceso,
      coordenadas: f.coordenadas,
      requisitos: f.requisitos,
    },
  };
}

export function allActivities(): CatalogDetail[] {
  return [
    ...barrancos.map(fromBarranco),
    ...crags.map(fromCrag),
    ...ferratas.map(fromFerrata),
  ];
}

export function toSummary(item: CatalogDetail): CatalogItem {
  const { descripcionLarga, caracteristicas, materialIncluido, grupoMinimo, datosTecnicos, ...summary } = item;
  return summary;
}
