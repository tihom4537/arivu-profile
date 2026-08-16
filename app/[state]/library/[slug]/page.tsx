import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { fetchLibrary } from '@/lib/api'
import { canonicalPath, isKnownState, normaliseSlug } from '@/lib/url'
import { Achievements } from '@/components/Achievements'
import { AudiencePills } from '@/components/AudiencePills'
import { BadgeList } from '@/components/BadgeList'
import { ImpactGrid } from '@/components/ImpactGrid'
import { JourneyHeatmap } from '@/components/JourneyHeatmap'
import { ProfileHeader } from '@/components/ProfileHeader'
import { SubmissionFeed } from '@/components/SubmissionFeed'

type Params = { params: Promise<{ state: string; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const data = await fetchLibrary(normaliseSlug(slug))
  if (!data) return {}

  const { profile, achievements } = data
  const title = [profile.library_name || profile.gram_panchayat, profile.name]
    .filter(Boolean)
    .join(' — ')

  return {
    title,
    description:
      `${achievements.stars} stars earned · ${achievements.people_reached} people reached` +
      ` at ${profile.library_name ?? 'the library'}.`,
    openGraph: { title, type: 'profile' },
  }
}

export default async function LibraryProfilePage({ params }: Params) {
  const { state, slug } = await params
  if (!isKnownState(state)) notFound()

  const data = await fetchLibrary(normaliseSlug(slug))
  if (!data) notFound()

  // A retired slug still resolves — the GP-name import rewrote ~94 of them — but the
  // visitor is moved on to the canonical URL rather than left on a stale one.
  const canonical = canonicalPath(data.profile.state, data.profile.slug)
  if (canonicalPath(state, normaliseSlug(slug)) !== canonical) {
    permanentRedirect(canonical)
  }

  return (
    <main>
      <ProfileHeader profile={data.profile} />

      <div className="divide-y divide-hairline">
        <JourneyHeatmap journey={data.journey} submissions={data.submissions} />
        <Achievements achievements={data.achievements} />
        <ImpactGrid impact={data.impact} />
        <BadgeList badges={data.badges} />
        <AudiencePills audiences={data.audiences} />
        <SubmissionFeed submissions={data.submissions} />
      </div>

      <footer className="px-5 py-8 text-center text-[13px] text-muted">
        Arivu Mitra · Gram Panchayat Libraries
      </footer>
    </main>
  )
}
