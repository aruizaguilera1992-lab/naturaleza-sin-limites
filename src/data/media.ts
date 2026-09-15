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
    src: '/__l5e/assets-v1/5e728c01-ad0a-4a12-b76c-8183ee620265/canyoning-rappel-documentary.jpg',
    alt: 'Barranquista equipado con casco, neopreno y cuerda durante un rápel junto al agua',
    sourceUrl: 'https://www.pexels.com/photo/active-man-rappelling-on-cliff-26976907/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia horizontal de un grupo en un barranco de Málaga, con rápel y agua.',
  },
  climbing: {
    src: '/__l5e/assets-v1/e40e7952-d6ca-479e-875e-3dd10230318b/limestone-climbing-documentary.jpg',
    alt: 'Escalador progresando con cuerda y material técnico sobre una pared de roca caliza',
    sourceUrl: 'https://www.pexels.com/photo/rock-climber-ascending-limestone-cliff-in-damascus-37516088/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia en caliza malagueña que muestre también al asegurador.',
  },
  ferrata: {
    src: '/__l5e/assets-v1/088fb4e6-095b-42bc-a46f-37a8742383e8/via-ferrata-documentary.jpg',
    alt: 'Deportista con casco y arnés avanzando por un tramo de cable en una pared de montaña',
    sourceUrl: 'https://www.pexels.com/photo/man-climbing-on-rope-17661923/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia en ferrata andaluza con disipador y anclaje claramente visibles.',
  },
  functionalTraining: {
    src: '/__l5e/assets-v1/b559efd8-e928-40a6-8545-5f2e7fff9124/functional-training-documentary.jpg',
    alt: 'Grupo realizando una sesión real de entrenamiento funcional en un espacio abierto y sobrio',
    sourceUrl: 'https://www.pexels.com/photo/outdoor-crossfit-training-session-under-a-bamboo-roof-36400030/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia de una sesión de Vértigo Sapiens con permiso de imagen.',
  },
  ropeDetail: {
    src: '/__l5e/assets-v1/02e5d20c-ffcf-4c8b-94b8-12c1fde1dba7/rope-detail-documentary.jpg',
    alt: 'Detalle real de unas manos preparando la cuerda y el material de seguridad de escalada',
    sourceUrl: 'https://www.pexels.com/photo/a-person-holding-the-rope-from-the-harness-5916512/',
    license: pexelsLicense,
    status: 'stock-provisional',
    replacementNote: 'Alternativa documental cuando no existe una fotografía autorizada del equipo.',
  },
  elTorcal: {
    src: '/__l5e/assets-v1/51949523-b0b6-4f49-a364-5493f1bedc61/el-torcal-andalusia.jpg',
    alt: 'Formaciones naturales de roca caliza en El Torcal de Antequera, Málaga',
    sourceUrl: 'https://www.pexels.com/photo/scenic-rocky-landscape-of-el-torcal-in-andalusia-33117743/',
    license: pexelsLicense,
    status: 'stock-provisional',
    replacementNote: 'Paisaje documental de Málaga para evitar inventar retratos del equipo.',
  },
  caminito: {
    src: '/__l5e/assets-v1/5c3648d4-0614-4d5f-ad47-aeab75a3df5a/caminito-del-rey-malaga.jpg',
    alt: 'Grupo recorriendo el desfiladero calizo del Caminito del Rey en Málaga',
    sourceUrl: 'https://www.pexels.com/photo/group-of-people-walking-on-a-narrow-path-in-a-canyon-caminito-del-rey-malaga-spain-17941747/',
    license: pexelsLicense,
    status: 'stock-provisional',
    replacementNote: 'Paisaje documental de Málaga para secciones generales y de contacto.',
  },
} as const satisfies Record<string, MediaAsset>;
