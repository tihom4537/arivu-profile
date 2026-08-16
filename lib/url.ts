/**
 * Canonical library URLs: /{state}/library/{slug}, e.g. /KA/library/avalahalli.
 *
 * Slugs are ASCII by construction (see app/public/slugs.py) — a Kannada slug would
 * have to be percent-encoded to travel in a URL, and these links are shared through
 * WhatsApp where that is unreadable. Encoding here is belt-and-braces: an HTTP
 * `Location` header is ASCII-only, and handing Node a non-ASCII string throws
 * ERR_INVALID_CHAR, which surfaces as a 500 on every profile.
 */

/** Every library is in Karnataka today; the URL already has room for more. */
const KNOWN_STATES = new Set(['KA'])

export function isKnownState(state: string): boolean {
  return KNOWN_STATES.has(state.toUpperCase())
}

export function canonicalPath(state: string, slug: string): string {
  return `/${state.toUpperCase()}/library/${encodeURIComponent(slug)}`
}

/** Slugs are lowercase; accept any casing and a stray trailing slash from a shared link. */
export function normaliseSlug(raw: string): string {
  let s = raw
  try {
    s = decodeURIComponent(raw)
  } catch {
    // A malformed escape sequence is a bad URL, not a crash — fall through and let it
    // be treated as an unknown slug, which 404s.
  }
  return s.trim().replace(/\/+$/, '').toLowerCase()
}
