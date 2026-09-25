export const OFFICIAL_YOUTUBE_CHANNEL = 'https://youtube.com/@naturaleza.sin.limites?si=EOj2suHoEUZKyXaU';
export const OFFICIAL_YOUTUBE_CHANNEL_NAME = 'Naturaleza Sin Límites';

export interface YoutubeVideo {
  youtubeId: string;
  title: string;
  sourceUrl: string;
  channel: typeof OFFICIAL_YOUTUBE_CHANNEL_NAME;
  thumbnail?: string;
  relatedPostSlugs?: string[];
}

const thumb = (youtubeId: string) => `/images/youtube/${youtubeId}.jpg`;

const video = (youtubeId: string, title: string, relatedPostSlugs?: string[]): YoutubeVideo => ({
  youtubeId,
  title,
  sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
  channel: OFFICIAL_YOUTUBE_CHANNEL_NAME,
  thumbnail: thumb(youtubeId),
  relatedPostSlugs,
});

/** Vídeos comprobados directamente en el canal oficial. */
export const officialYoutubeVideos: YoutubeVideo[] = [
  video('Q6xfrWBmpc0', 'Cueva de los Chorros 01/08/2026. Riópar, Albacete.'),
  video('ImfyWysSlxU', 'ESPELEOBARRANQUISMO - Travesía Sil de las Perlas - La Covona | Valporquero de Torío, León (15/06/26)'),
  video('48XZMU7Hwtw', 'SIMA RASCA, TORCAL DE ANTEQUERA 06/06/2026'),
  video('U87YbmUD6zU', 'Sima de las Lepiotas 17/05/26, GES/SEM'),
  video('TBVMHN4MPoQ', 'ENCUENTRO EN SORBAS, 02/05/26 TRAVESÍA DE COVADURA'),
  video('Qkmf1V47rhc', 'ENCUENTRO EN SORBAS, 01/05/26. TRAVESÍA CLÁSICA EN COMPLEJO GEP'),
  video('TCCHBbtIFj8', 'ENCUENTRO EN SORBAS, 01/05/26. TRAVESÍA SO-21, CUEVA DEL AGUA GALERÍA FÓSIL'),
  video('kqFCkljcP8I', 'ENCUENTRO DE SORBAS GES-SEM 01/05/26 CUEVA DEL YESO.'),
  video('0s0imVjb-zE', 'Zarzalones Superior 12-04-26'),
  video('-dqK-7pZsls', 'Iniciación al descenso de cañones GES - 21 y 22/03/2026', ['guia-completa-primer-descenso-barrancos-malaga']),
  video('9Ic_uJ5-m9c', 'Encuentro de Espeleología GES/SEM Lújar 15/03/26'),
  video('qUsXK3u1gnI', 'Encuentro de Espeleología GES/SEM Lújar 14/03/26'),
  video('xd9qKdM16xQ', 'BARRANCO JOROX (Descenso acúatico) 01/03/26'),
  video('0wFvTY0SC6c', 'SIMA TUTO 22/02/2026'),
];

export const blogYoutubeVideos = officialYoutubeVideos.slice(0, 9);
export const getRelatedYoutubeVideo = (postSlug: string) =>
  officialYoutubeVideos.find((item) => item.relatedPostSlugs?.includes(postSlug));
