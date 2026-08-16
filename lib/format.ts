/** Small presentation helpers shared across the profile sections. */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Parse an ISO date as a plain calendar date.
 *
 * `new Date('2026-08-15')` is parsed as UTC midnight and then rendered in the
 * viewer's timezone, which shows Aug 14 to anyone west of Greenwich. These are
 * dates, not instants, so build them locally instead.
 */
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "Aug 15, 2026" */
export function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = parseDay(iso.slice(0, 10))
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** "April 2026" — for "Using Arivu Mitra since …" */
export function formatMonthYear(isoTimestamp: string | null): string {
  if (!isoTimestamp) return ''
  const d = parseDay(isoTimestamp.slice(0, 10))
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

export function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Monday of the week containing `d`. */
export function mondayOf(d: Date): Date {
  const out = new Date(d)
  out.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return out
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(d.getDate() + n)
  return out
}

/** Matches HEATMAP_STEPS in app/public/profile_stats.py. */
export function heatmapLevel(count: number): number {
  return Math.min(count, 4)
}

/** "More than 30 · Children (6–12), Women" — the activity meta line. */
export function metaLine(footfall: string | null, audiences: string[]): string {
  return [footfall, audiences.join(', ')].filter(Boolean).join(' · ')
}

export const pluralWeeks = (n: number) => `${n} ${n === 1 ? 'week' : 'weeks'}`

/** "Monday, 11 August 2026" — the journey cell tooltip. */
export function formatLongDay(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
