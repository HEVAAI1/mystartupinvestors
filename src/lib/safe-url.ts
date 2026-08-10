const ALLOWED_PROTOCOLS = ["http:", "https:"];
const MAILTO_PROTOCOL = "mailto:";

// Strips ASCII control characters (0x00-0x1f, 0x7f), since browsers ignore
// them inside schemes like "java<TAB>script:", then trims whitespace.
function normalize(value: string): string {
  let result = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code > 0x1f && code !== 0x7f) {
      result += char;
    }
  }
  return result.trim();
}

function hasScheme(value: string): boolean {
  const slashIndex = value.indexOf("/");
  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return false;
  return slashIndex === -1 || colonIndex < slashIndex;
}

export function sanitizeHref(
  href: string | null | undefined,
  opts?: { allowMailto?: boolean }
): string | null {
  if (!href) return null;

  const cleaned = normalize(href);
  if (!cleaned) return null;

  const allowedProtocols = opts?.allowMailto
    ? [...ALLOWED_PROTOCOLS, MAILTO_PROTOCOL]
    : ALLOWED_PROTOCOLS;

  try {
    const url = new URL(cleaned);
    return allowedProtocols.includes(url.protocol) ? url.href : null;
  } catch {
    if (!hasScheme(cleaned)) {
      try {
        const url = new URL(`https://${cleaned}`);
        return allowedProtocols.includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function isSafeHref(href: unknown, opts?: { allowMailto?: boolean }): boolean {
  if (typeof href !== "string") return false;
  return sanitizeHref(href, opts) !== null;
}
