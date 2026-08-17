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
    <main className="w-full max-w-page bg-white md:max-w-none">
      <ProfileHeader profile={data.profile} />

      {/*
        Mobile: one column, in the order the sections are written.
        Desktop: journey band, then audience band, then the activity feed on the left
        with the stat sidebar on the right. Placement is explicit grid row/column so
        the arrangement does not depend on DOM order.
      */}
      <div
        className="flex flex-col gap-[31px] px-5 pb-[60px] pt-6
                   md:grid md:grid-cols-[1fr_372px] md:items-start md:gap-10
                   md:px-[clamp(40px,6vw,120px)] md:pb-16 md:pt-8
                   wide:px-[clamp(120px,10vw,220px)]"
      >
        <div className="md:col-span-2 md:col-start-1 md:row-start-1">
          <JourneyHeatmap journey={data.journey} submissions={data.submissions} />
        </div>

        {/* Nested a level deeper than the other sections, so it carries its own gap. */}
        <div className="flex flex-col gap-[31px] md:col-start-2 md:row-start-3">
          <Achievements achievements={data.achievements} />
          <ImpactGrid impact={data.impact} />
          <BadgeList badges={data.badges} />
        </div>

        <div className="md:col-span-2 md:col-start-1 md:row-start-2">
          <AudiencePills audiences={data.audiences} />
        </div>

        <div className="md:col-start-1 md:row-start-3">
          <SubmissionFeed submissions={data.submissions} />
        </div>
      </div>

      <footer className="px-5 pb-10 text-center text-[13px] text-faint">
        Arivu Mitra · Gram Panchayat Libraries
      </footer>
    </main>
  )
}
