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
    src: '/__l5e/assets-v1/b61b5914-4df2-4b52-8d6f-eb28433230d2/canyoning-equipped-documentary.webp',
    alt: 'Barranquista equipado con casco, protección térmica, arnés y cuerda durante un rápel sobre el agua',
    sourceUrl: 'https://www.pexels.com/photo/woman-with-rope-on-edge-11792447/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia horizontal de un grupo en un barranco de Málaga, con neopreno, rápel y agua.',
  },
  climbing: {
    src: '/__l5e/assets-v1/b3d3fef7-20bb-4974-b3b2-741cd8afefa3/limestone-climbing-documentary.webp',
    alt: 'Escalador progresando con cuerda y material técnico sobre una pared de roca caliza',
    sourceUrl: 'https://www.pexels.com/photo/rock-climber-ascending-limestone-cliff-in-damascus-37516088/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia en caliza malagueña que muestre también al asegurador.',
  },
  ferrata: {
    src: '/__l5e/assets-v1/1bc836c9-ddfb-444a-ae92-e64acbbf1779/via-ferrata-documentary.webp',
    alt: 'Deportista con casco y arnés avanzando por un tramo de cable en una pared de montaña',
    sourceUrl: 'https://www.pexels.com/photo/man-climbing-on-rope-17661923/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia en ferrata andaluza con disipador y anclaje claramente visibles.',
  },
  functionalTraining: {
    src: '/__l5e/assets-v1/569003b3-0e21-43cd-aaa8-ae6387d66bea/functional-training-documentary.webp',
    alt: 'Grupo realizando una sesión real de entrenamiento funcional en un espacio abierto y sobrio',
    sourceUrl: 'https://www.pexels.com/photo/outdoor-crossfit-training-session-under-a-bamboo-roof-36400030/',
    license: pexelsLicense,
    status: 'propia-pendiente',
    replacementNote: 'Sustituir por una foto propia de una sesión de Vértigo Sapiens con permiso de imagen.',
  },
  ropeDetail: {
    src: '/__l5e/assets-v1/890c3cf4-e7ef-488a-a13f-7a1defef3d74/rope-detail-documentary.webp',
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
    src: '/__l5e/assets-v1/9eafaa23-629f-4814-8686-f24d84181708/caminito-del-rey-malaga.webp',
    alt: 'Grupo recorriendo el desfiladero calizo del Caminito del Rey en Málaga',
    sourceUrl: 'https://www.pexels.com/photo/group-of-people-walking-on-a-narrow-path-in-a-canyon-caminito-del-rey-malaga-spain-17941747/',
    license: pexelsLicense,
    status: 'stock-provisional',
    replacementNote: 'Paisaje documental de Málaga para secciones generales y de contacto.',
  },
} as const satisfies Record<string, MediaAsset>;
