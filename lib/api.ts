/**
 * Typed access to the profile payload from arivu-backend.
 *
 * This app has no backend of its own — it calls the FastAPI service that already runs
 * in production rather than shipping a second copy of arivu-backend alongside it.
 * The endpoint sits under /arivu/ because that path is already proxied to that
 * service, so exposing it needed no nginx change.
 *
 * One request returns the whole page. Requests are server-side only, so the base URL
 * never reaches the browser.
 */

export interface Profile {
  public_id: number
  state: string
  slug: string
  name: string
  library_name: string | null
  district: string | null
  taluk: string | null
  gram_panchayat: string | null
  years_of_service: number | null
  member_since: string | null
  photo_url: string | null
  cover_photo_url: string | null
}

export interface Level {
  level: number
  name: string
  stars_to_next: number | null
  progress_pct: number
}

export interface Badge {
  key: string
  title: string
  description: string
  earned: boolean
  progress: number
  target: number
}

export interface Submission {
  id: string
  title: string
  date: string | null
  tag: string | null
  footfall_label: string | null
  audiences: string[]
  photos: string[]
}

export interface ProfilePayload {
  profile: Profile
  journey: { days: Record<string, number>; year: number; today: string }
  achievements: {
    streak_weeks: number
    stars: number
    people_reached: number
    level: Level
  }
  impact: {
    this_week: number
    this_month: number
    this_year: number
    people_reached: number
  }
  badges: Badge[]
  audiences: { key: string; label: string; count: number }[]
  submissions: Submission[]
}

const API_BASE = process.env.ARIVU_API_BASE ?? 'http://localhost:8001'
const API_PREFIX = '/arivu/public/api'

async function get(path: string, label: string): Promise<ProfilePayload | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    // Photo URLs are presigned and short-lived, so a cached page would serve dead
    // images. Render fresh every time.
    cache: 'no-store',
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Profile API ${res.status} for ${label}`)
  return res.json()
}

/** Look a library up by its GP slug — the public URL /{state}/library/{slug}. */
export function fetchLibrary(slug: string): Promise<ProfilePayload | null> {
  return get(`${API_PREFIX}/libraries/${encodeURIComponent(slug)}`, `library ${slug}`)
}
