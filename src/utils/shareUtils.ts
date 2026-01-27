// src/utils/shareUtils.ts

type NativeShareNavigator = Navigator & {
  share?: (data: {
    title?: string;
    text?: string;
    url?: string;
  }) => Promise<void>;
};

/**
 * Sportsive share philosophy:
 * - Let the OS decide where to share (native share sheet)
 * - Fallback = copy link
 */

export function canNativeShare(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof (navigator as NativeShareNavigator).share === "function"
  );
}

export async function nativeShare(payload: {
  url: string;
  text?: string;
}) {
  if (!canNativeShare()) return false;

  const nav = navigator as NativeShareNavigator;

  try {
    await nav.share?.({
      text: payload.text,
      url: payload.url,
    });
    return true;
  } catch {
    // user cancelled or failed → silent
    return false;
  }
}

export async function copyToClipboard(text: string) {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    !navigator.clipboard.writeText
  ) {
    fallbackCopy(text);
    return;
  }

  await navigator.clipboard.writeText(text);
}

function fallbackCopy(text: string) {
  if (typeof document === "undefined") return;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  document.execCommand("copy");
  document.body.removeChild(textarea);
}
