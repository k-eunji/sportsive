// src/utils/shareUtils.ts

export function buildTwitterShareUrl(url: string, text?: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text ?? ""
  )}&url=${encodeURIComponent(url)}`;
}

export function buildTelegramShareUrl(url: string, text?: string) {
  return `https://t.me/share/url?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent(text ?? "")}`;
}

/** WhatsApp 공유 */
export function buildWhatsAppShareUrl(url: string, text?: string) {
  const msg = `${text ? text + " " : ""}${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

/** Instagram 공유는 공식 URL 없음 → 앱 실행 시도 */
export function buildInstagramAppUrl() {
  return `instagram://app`;
}
