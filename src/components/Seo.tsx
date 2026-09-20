import { Helmet } from 'react-helmet-async';
import { absoluteUrl } from '@/lib/site';

interface SeoProps {
  /** Título completo de la pestaña y de los resultados de búsqueda. */
  title: string;
  description: string;
  /** Ruta interna (p. ej. "/actividades"). Se convierte en URL canónica absoluta. */
  path: string;
  /** Marca la página como no indexable (404, rutas privadas). */
  noindex?: boolean;
  type?: 'website' | 'article';
}

/**
 * Metadatos por página. Centraliza título, descripción, canónica y Open Graph
 * para que cada ruta tenga los suyos y no herede los genéricos de index.html.
 */
export function Seo({ title, description, path, noindex = false, type = 'website' }: SeoProps) {
  const url = absoluteUrl(path);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {noindex && <meta name="robots" content="noindex, follow" />}
    </Helmet>
  );
}
