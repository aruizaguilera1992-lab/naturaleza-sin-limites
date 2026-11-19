/**
 * Enlace de invitación a un grupo de WhatsApp.
 * Solo se aceptan invitaciones oficiales de chat.whatsapp.com; cualquier otra
 * URL (wa.me, javascript:, enlaces acortados…) se descarta.
 */
export const WA_GROUP_RE = /^https:\/\/chat\.whatsapp\.com\/(invite\/)?[A-Za-z0-9]{10,40}\/?$/;

export const safeWhatsappGroup = (u?: string | null) => {
  const v = (u ?? '').trim();
  return WA_GROUP_RE.test(v) ? v : null;
};
