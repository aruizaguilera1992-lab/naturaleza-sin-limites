import { useMemo } from 'react';
import { barrancos, Barranco } from '@/data/barrancos';
import { cuevas, Cueva } from '@/data/caves';
import { crags, Crag } from '@/data/crags';
import { ferratas, Ferrata } from '@/data/ferratas';

export interface UnifiedActivity {
  id: string;
  name: string;
  activityType: 'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas';
  province: string;
  zone: string;
  level: string;
  levelLabel: string;
  levelOrder: number;
  duration: string;
  durationHours: number;
  price: string;
  priceValue: number;
  shortDescription: string;
  longDescription: string;
  image: string;
  imageLarge: string;
  characteristics: string[];
  bestSeason: string;
  minGroup: number;
  materialIncluded: boolean;
  access: string;
  externalUrl: string;
  externalSource: string;
  coordinates?: { lat: number; lng: number };
  includes: string[];
  highlights: string[];
  requirements: {
    minAge: number;
    physicalCondition: string;
    previousExperience: boolean;
  };
  // Type-specific data
  originalData: Barranco | Cueva | Crag | Ferrata;
}

function parsePrice(price: string): number {
  const match = price.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (duration.includes('-')) {
      const parts = duration.match(/(\d+)-(\d+)/);
      if (parts) {
        return (parseInt(parts[1], 10) + parseInt(parts[2], 10)) / 2;
      }
    }
    return num;
  }
  return 4; // default
}

function mapBarrancoLevel(nivel: string): { label: string; order: number } {
  const levels: Record<string, { label: string; order: number }> = {
    'V1': { label: 'Principiante', order: 1 },
    'V2': { label: 'Principiante+', order: 2 },
    'V3': { label: 'Intermedio', order: 3 },
    'V4': { label: 'Avanzado', order: 4 },
    'V5': { label: 'Experto', order: 5 },
    'V6': { label: 'Experto+', order: 6 },
  };
  return levels[nivel] || { label: nivel, order: 3 };
}

function mapCuevaLevel(nivel: string): { label: string; order: number } {
  const levels: Record<string, { label: string; order: number }> = {
    'I': { label: 'Principiante', order: 1 },
    'II': { label: 'Iniciación', order: 2 },
    'III': { label: 'Intermedio', order: 3 },
    'IV': { label: 'Avanzado', order: 4 },
    'V': { label: 'Experto', order: 5 },
  };
  return levels[nivel] || { label: nivel, order: 3 };
}

function mapFerrataLevel(clasificacion: string): { label: string; order: number } {
  const levels: Record<string, { label: string; order: number }> = {
    'K1': { label: 'Muy Fácil', order: 1 },
    'K2': { label: 'Fácil', order: 2 },
    'K3': { label: 'Intermedio', order: 3 },
    'K4': { label: 'Difícil', order: 4 },
    'K5': { label: 'Muy Difícil', order: 5 },
    'K6': { label: 'Extremo', order: 6 },
  };
  return levels[clasificacion] || { label: clasificacion, order: 3 };
}

function mapCragLevel(gradoMinimo: string): { label: string; order: number } {
  const grade = gradoMinimo.toLowerCase();
  if (grade.startsWith('4') || grade.startsWith('5a') || grade.startsWith('5b')) {
    return { label: 'Principiante', order: 1 };
  }
  if (grade.startsWith('5c') || grade.startsWith('6a') || grade.startsWith('6b')) {
    return { label: 'Intermedio', order: 2 };
  }
  if (grade.startsWith('6c') || grade.startsWith('7a') || grade.startsWith('7b')) {
    return { label: 'Avanzado', order: 3 };
  }
  return { label: 'Experto', order: 4 };
}

export function useActivitiesData() {
  const activities = useMemo<UnifiedActivity[]>(() => {
    const unified: UnifiedActivity[] = [];
    
    // Map barrancos
    barrancos.forEach(b => {
      const levelInfo = mapBarrancoLevel(b.nivel);
      unified.push({
        id: `barranco-${b.id}`,
        name: b.nombre,
        activityType: 'barranquismo',
        province: b.provincia,
        zone: b.provincia,
        level: b.nivel,
        levelLabel: levelInfo.label,
        levelOrder: levelInfo.order,
        duration: b.duracion,
        durationHours: b.duracionHoras,
        price: b.precio,
        priceValue: parsePrice(b.precio),
        shortDescription: b.descripcionCorta,
        longDescription: b.descripcionLarga,
        image: b.imagen,
        imageLarge: b.imagenGrande,
        characteristics: b.caracteristicas,
        bestSeason: b.mejorEpoca,
        minGroup: b.grupoMinimo,
        materialIncluded: b.materialIncluido,
        access: b.acceso,
        externalUrl: b.urlInfo,
        externalSource: 'infobarrancos.es',
        includes: b.incluye,
        highlights: [],
        requirements: {
          minAge: b.requisitos.edadMinima,
          physicalCondition: b.requisitos.condicionFisica,
          previousExperience: false,
        },
        originalData: b,
      });
    });
    
    // Map cuevas
    cuevas.forEach(c => {
      const levelInfo = mapCuevaLevel(c.nivelTecnico);
      unified.push({
        id: `cueva-${c.id}`,
        name: c.nombre,
        activityType: 'espeleologia',
        province: c.provincia,
        zone: c.zona,
        level: c.nivelTecnico,
        levelLabel: levelInfo.label,
        levelOrder: levelInfo.order,
        duration: c.duracion,
        durationHours: parseDuration(c.duracion),
        price: c.precio,
        priceValue: parsePrice(c.precio),
        shortDescription: c.descripcionCorta,
        longDescription: c.descripcionLarga,
        image: c.imagen,
        imageLarge: c.imagenGrande,
        characteristics: c.caracteristicas,
        bestSeason: c.mejorEpoca,
        minGroup: c.grupoMinimo,
        materialIncluded: c.materialIncluido,
        access: c.acceso,
        externalUrl: c.urlInfo,
        externalSource: 'catfae.com',
        coordinates: c.coordenadas,
        includes: c.incluye,
        highlights: c.destacados,
        requirements: {
          minAge: c.requisitos.edadMinima,
          physicalCondition: c.requisitos.condicionFisica,
          previousExperience: c.requisitos.experienciaPrevia,
        },
        originalData: c,
      });
    });
    
    // Map crags
    crags.forEach(c => {
      const levelInfo = mapCragLevel(c.gradoMinimo);
      unified.push({
        id: `crag-${c.id}`,
        name: c.nombre,
        activityType: 'escalada',
        province: c.provincia,
        zone: c.zona,
        level: `${c.gradoMinimo}-${c.gradoMaximo}`,
        levelLabel: levelInfo.label,
        levelOrder: levelInfo.order,
        duration: c.duracion,
        durationHours: c.duracion === 'Media jornada' ? 4 : c.duracion === 'Jornada completa' ? 8 : 16,
        price: c.precio,
        priceValue: parsePrice(c.precio),
        shortDescription: c.descripcionCorta,
        longDescription: c.descripcionLarga,
        image: c.imagen,
        imageLarge: c.imagenGrande,
        characteristics: c.caracteristicas,
        bestSeason: c.mejorEpoca,
        minGroup: c.grupoMinimo,
        materialIncluded: c.materialIncluido,
        access: c.acceso,
        externalUrl: c.urlInfo,
        externalSource: 'thecrag.com',
        coordinates: c.coordenadas,
        includes: c.incluye,
        highlights: c.destacados,
        requirements: {
          minAge: c.requisitos.edadMinima,
          physicalCondition: c.requisitos.condicionFisica,
          previousExperience: c.requisitos.experienciaPrevia,
        },
        originalData: c,
      });
    });
    
    // Map ferratas
    ferratas.forEach(f => {
      const levelInfo = mapFerrataLevel(f.clasificacion);
      unified.push({
        id: `ferrata-${f.id}`,
        name: f.nombre,
        activityType: 'ferratas',
        province: f.provincia === 'cualquiera' ? 'Málaga' : f.provincia,
        zone: f.zona,
        level: f.clasificacion,
        levelLabel: levelInfo.label,
        levelOrder: levelInfo.order,
        duration: f.duracion,
        durationHours: f.duracionHoras,
        price: f.precio,
        priceValue: parsePrice(f.precio),
        shortDescription: f.descripcionCorta,
        longDescription: f.descripcionLarga,
        image: f.imagen,
        imageLarge: f.imagenGrande,
        characteristics: f.caracteristicas,
        bestSeason: f.mejorEpoca,
        minGroup: f.grupoMinimo,
        materialIncluded: f.materialIncluido,
        access: f.acceso,
        externalUrl: f.urlInfo,
        externalSource: 'rocjumper.com',
        coordinates: f.coordenadas,
        includes: f.incluye,
        highlights: f.destacados,
        requirements: {
          minAge: f.requisitos.edadMinima,
          physicalCondition: f.requisitos.condicionFisica,
          previousExperience: f.requisitos.experienciaPrevia,
        },
        originalData: f,
      });
    });
    
    return unified;
  }, []);
  
  const counts = useMemo(() => ({
    todas: activities.length,
    espeleologia: activities.filter(a => a.activityType === 'espeleologia').length,
    barranquismo: activities.filter(a => a.activityType === 'barranquismo').length,
    escalada: activities.filter(a => a.activityType === 'escalada').length,
    ferratas: activities.filter(a => a.activityType === 'ferratas').length,
  }), [activities]);
  
  return { activities, counts };
}
