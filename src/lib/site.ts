/** Canonical public site origin  always use www (apex 308-redirects here). */
export const SITE_URL = "https://www.madadgaar.com.pk";

export const SITE_NAME = "Madadgaar Expert Partner";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/Media/Group%2033.png`;

export const DEFAULT_DESCRIPTION =
  "Pakistan's most trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare multiple options across Pakistan and find the perfect fit for your needs.";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
