const INTERNAL_URL_PATTERN =
  /^https?:\/\/(admin|partner|agent|api)\.madadgaar\.com\.pk/i;

const GENERIC_URL_PATTERN = /^https?:\/\//i;

const LOREM_PATTERN =
  /\b(lorem ipsum|dolor sit amet|tempora ea|ullam duc|aliquip ex ea|molesti)\b/i;

const NEUTRAL_PROPERTY_DESCRIPTION =
  "View property details, pricing, and location on Madadgaar — Pakistan's trusted property marketplace.";

/**
 * Strip HTML and collapse whitespace for meta / JSON-LD descriptions.
 */
export function stripHtml(text: unknown, maxLen = 160): string {
  if (text == null) return "";
  const raw = String(text);
  const stripped = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return "";
  return stripped.length <= maxLen
    ? stripped
    : `${stripped.slice(0, maxLen - 3)}...`;
}

/**
 * Reject internal admin URLs and bare URLs used as placeholder descriptions.
 */
export function sanitizePublicDescription(
  text: unknown,
  fallback = NEUTRAL_PROPERTY_DESCRIPTION
): string {
  if (text == null) return fallback;
  const cleaned = stripHtml(text, 500);
  if (!cleaned) return fallback;
  if (INTERNAL_URL_PATTERN.test(cleaned.trim())) return fallback;
  if (GENERIC_URL_PATTERN.test(cleaned.trim()) && cleaned.trim().length < 120) {
    return fallback;
  }
  return cleaned;
}

export function isSeedBlogSlug(slug: string): boolean {
  if (!slug) return true;
  if (/\s/.test(slug) || /%20/i.test(slug)) return true;
  if (LOREM_PATTERN.test(slug)) return true;
  return false;
}

export function isSeedBlogContent(blog: {
  title?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  authorName?: string;
}): boolean {
  const title = blog.title || "";
  const excerpt = blog.excerpt || "";
  if (LOREM_PATTERN.test(title) || LOREM_PATTERN.test(excerpt)) return true;
  if (blog.authorName === "Admin" && !blog.featuredImage) return true;
  const img = blog.featuredImage || "";
  if (img && !img.includes("madadgaar.com.pk") && !img.includes("image.madadgaar.com.pk")) {
    try {
      const host = new URL(img).hostname;
      if (!host.endsWith("madadgaar.com.pk") && !host.endsWith("r2.dev")) return true;
    } catch {
      return true;
    }
  }
  return false;
}

export { NEUTRAL_PROPERTY_DESCRIPTION };
