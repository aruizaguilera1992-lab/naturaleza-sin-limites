export interface OutingImageInput {
  /** Ruta de la foto propia escrita en la ficha del catálogo (almacén privado). */
  catalogImagePath?: string | null;
  /** URL firmada devuelta por la función outing-photo, si ya está disponible. */
  photoUrl: string | null;
  /** true cuando la consulta de la foto propia ha terminado, con o sin foto. */
  settled: boolean;
  /** Imagen local del catálogo, solo como respaldo. */
  localImage?: string | null;
}

/**
 * Elige la imagen que se muestra de una actividad: la foto de la ficha del
 * catálogo manda sobre la imagen local. Mientras la foto propia está en camino
 * no se muestra la local, para que la pantalla no cambie de imagen al cargar.
 */
export function resolveOutingImage({
  catalogImagePath,
  photoUrl,
  settled,
  localImage,
}: OutingImageInput): string | null {
  if (!catalogImagePath) return localImage ?? null;
  if (!settled) return null;
  return photoUrl ?? localImage ?? null;
}
