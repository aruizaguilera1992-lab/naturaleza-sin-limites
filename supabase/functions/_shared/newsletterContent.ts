export const newsletterSegments = ['barranquismo', 'ferratas', 'espeleologia'] as const;
export const escapeNewsletterHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
export function newsletterEligible(sub: { status: string; confirmed_at: string | null; unsubscribed_at: string | null }, confirmation: string): boolean {
  return sub.status === 'confirmado' && sub.confirmed_at === confirmation && !sub.unsubscribed_at;
}
export function campaignDedupeKey(campaign: string, subscriber: string): string { return `campaign:${campaign}:sub:${subscriber}`; }
export function newsletterInline(text: string): string {
  const tokens: string[] = [];
  const protect = (html: string) => { tokens.push(html); return `\u0000${tokens.length - 1}\u0000`; };
  return escapeNewsletterHtml(text).replace(/`([^`]+)`/g, (_, code: string) => protect(`<code>${code}</code>`))
    .replace(/(?<!!)\[([^\]]+)\]\(([^\s)]+)\)/g, (whole, label: string, url: string) => {
      if (!(url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) && !/^https:\/\/[^/\s]+/.test(url)) return whole;
      const href = url.startsWith('/') ? `https://naturalezasinlimites.es${url}` : url;
      return protect(`<a href="${href}" target="_blank" rel="noopener noreferrer">${newsletterInline(label)}</a>`);
    }).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => tokens[Number(i)] ?? '');
}
export function newsletterBody(content: string): string {
  return content.split('\n').map(line => {
    const image = /^!\[([^\]"']*)\]\((\/images\/[A-Za-z0-9_./-]+\.(?:jpe?g|png|webp|avif))\)$/i.exec(line.trim());
    if (image && !image[2].includes('..') && !image[2].includes('//')) return `<figure><img src="https://naturalezasinlimites.es${image[2]}" alt="${escapeNewsletterHtml(image[1])}" style="max-width:100%;height:auto"/><figcaption>${escapeNewsletterHtml(image[1])}</figcaption></figure>`;
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) return `<h${heading[1].length + 1}>${newsletterInline(heading[2])}</h${heading[1].length + 1}>`;
    return line.trim() ? `<p>${newsletterInline(line)}</p>` : '';
  }).join('\n');
}
export function renderNewsletter(c: { title: string; preheader: string; content: string }, unsubscribeUrl?: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#f4f4f4;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;line-height:1.65"><div style="display:none;max-height:0;overflow:hidden">${escapeNewsletterHtml(c.preheader)}</div><main style="max-width:640px;margin:auto;padding:28px;background:#fff"><p style="color:#666">NATURALEZA SIN LÍMITES</p><h1 style="color:#FF6B35">${escapeNewsletterHtml(c.title)}</h1>${newsletterBody(c.content)}<hr/><p style="font-size:13px">Naturaleza Sin Límites · Deportes de aventura en Málaga<br/>WhatsApp: +34 685 60 95 42</p>${unsubscribeUrl ? `<p style="font-size:13px"><a href="${escapeNewsletterHtml(unsubscribeUrl)}">Darme de baja</a></p>` : '<p style="font-size:13px">Vista previa · enlace de baja personalizado en el envío.</p>'}</main></body></html>`;
}