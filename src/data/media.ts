export type MediaStatus = 'stock-provisional' | 'propia-pendiente';

export interface MediaAsset {
  src: string;
  alt: string;
  sourceUrl: string;
  license: string;
  status: MediaStatus;
  replacementNote: string;
}

const pexelsLicense = 'https://www.pexels.com/license/';

/**
 * Catálogo central de fotografía editorial.
 * Para incorporar fotos propias basta con cambiar `src`, `sourceUrl`, `license`
 * y `status` en esta configuración, sin modificar los componentes.
 */
export const media = {
  canyoning: {
    src: '/images/barranquismo.webp',
    alt: 'Barranquista equipado con casco, protección térmica, arnés y cuerda durante un rápel sobre el agua',
    sourceUrl: 'https://www.pexels.com/photo/woman-with-rope-on-edge-11792447/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia horizontal de un grupo en un barranco de Málaga, con neopreno, rápel y agua.',
  },
  climbing: {
    src: '/images/escalada.webp',
    alt: 'Escalador progresando con cuerda y material técnico sobre una pared de roca caliza',
    sourceUrl: 'https://www.pexels.com/photo/rock-climber-ascending-limestone-cliff-in-damascus-37516088/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia en caliza malagueña que muestre también al asegurador.',
  },
  ferrata: {
    src: '/images/vias-ferratas.webp',
    alt: 'Deportista con casco y arnés avanzando por un tramo de cable en una pared de montaña',
    sourceUrl: 'https://www.pexels.com/photo/man-climbing-on-rope-17661923/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia en ferrata andaluza con disipador y anclaje claramente visibles.',
  },
  functionalTraining: {
    src: '/images/functional-training-documentary.jpg',
    alt: 'Grupo realizando una sesión real de entrenamiento funcional en un espacio abierto y sobrio',
    sourceUrl: 'https://www.pexels.com/photo/outdoor-crossfit-training-session-under-a-bamboo-roof-36400030/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia de una sesión de Vértigo Sapiens con permiso de imagen.',
  },
  ropeDetail: {
    src: '/images/rope-detail-documentary.jpg',
    alt: 'Detalle real de unas manos preparando la cuerda y el material de seguridad de escalada',
    sourceUrl: 'https://www.pexels.com/photo/a-person-holding-the-rope-from-the-harness-5916512/',
    license: pexelsLicense,
    status: 'stock-provisional',
    replacementNote: 'Alternativa documental cuando no existe una fotografía autorizada del equipo.',
  },
  elTorcal: {
    src: '/__l5e/assets-v1/3262feb8-6c9e-4452-accf-2f590daabd26/el-torcal-andalusia.webp',
    alt: 'Formaciones naturales de roca caliza en El Torcal de Antequera, Málaga',
    sourceUrl: 'https://www.pexels.com/photo/scenic-rocky-landscape-of-el-torcal-in-andalusia-33117743/',
    license: pexelsLicense,
    status: 'stock-provisional',
    replacementNote: 'Paisaje documental de Málaga para evitar inventar retratos del equipo.',
  },
  caminito: {
    src: '/images/caminito-del-rey-malaga.jpg',
    alt: 'Grupo recorriendo el desfiladero calizo del Caminito del Rey en Málaga',
    sourceUrl: 'https://www.pexels.com/photo/group-of-people-walking-on-a-narrow-path-in-a-canyon-caminito-del-rey-malaga-spain-17941747/',
    license: pexelsLicense,
    status: 'stock-provisional',
    replacementNote: 'Paisaje documental de Málaga para secciones generales y de contacto.',
  },
  espeleologiaHero: {
    src: '/images/espeleologia/hero.webp',
    alt: 'Persona con iluminación frontal explorando una gran sala subterránea de roca caliza con estalactitas y estalagmitas',
    sourceUrl: 'https://www.pexels.com/photo/adventurer-exploring-a-majestic-cave-interior-31651851/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia horizontal de una salida de espeleología con casco, frontal y mono técnico.',
  },
  espeleologiaVertical: {
    src: '/images/espeleologia/vertical.webp',
    alt: 'Espeleólogo descendiendo por cuerda en el pozo de entrada de una cavidad iluminada por luz natural',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:TraversitaM11.jpg',
    license: 'CC BY-SA 3.0',
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia de progresión vertical con arnés, descensor y casco.',
  },
  espeleologiaGrupo: {
    src: '/images/espeleologia.webp',
    alt: 'Grupo de espeleólogos con casco, frontal y mono técnico progresando por la entrada de una cueva',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Goikolau-11.jpg',
    license: 'CC BY-SA 4.0',
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia de un grupo de iniciación con permiso de imagen.',
  },
} as const satisfies Record<string, MediaAsset>;

