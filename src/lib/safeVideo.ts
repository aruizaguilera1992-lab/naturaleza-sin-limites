/**
 * Enlaces de vídeo del catálogo: solo YouTube y Vimeo, solo https.
 * Devuelve la URL de incrustación segura o null si el enlace no es válido.
 * Nunca se aceptan otros dominios, protocolos ni rutas con parámetros raros:
 * el vídeo se incrusta en la ficha pública y no debe poder cargar otra cosa.
 */
export function safeVideoEmbed(url: string | null | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, "");

  // YouTube: youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/shorts/ID, youtu.be/ID
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return validYoutubeId(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    let id = "";
    if (u.pathname === "/watch") id = u.searchParams.get("v") ?? "";
    else {
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/);
      if (m) id = m[2];
    }
    return validYoutubeId(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  // Vimeo: vimeo.com/ID o player.vimeo.com/video/ID
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/^(?:\/video)?\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }

  return null;
}

const validYoutubeId = (id: string) => /^[A-Za-z0-9_-]{6,20}$/.test(id);
