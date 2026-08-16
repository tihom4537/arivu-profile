'use client'

import { useState } from 'react'
import type { Badge } from '@/lib/api'
import { BADGE_ART, BADGE_FALLBACK } from './art'
import { ChevronRightIcon } from './icons'
import { Card, Section } from './Section'

/**
 * Earned badges, with "View all" revealing the rest of the catalogue greyed out and
 * showing progress — so an unearned badge reads as something to aim at rather than
 * something absent.
 */
export function BadgeList({ badges }: { badges: Badge[] }) {
  const [showAll, setShowAll] = useState(false)

  const earned = badges.filter((b) => b.earned)
  const visible = showAll ? badges : earned
  const hasMore = earned.length < badges.length

  if (badges.length === 0) return null

  return (
    <Section title="Badges earned">
      <Card className="divide-y divide-hairline">
        {visible.length === 0 && (
          <p className="p-5 text-[15px] text-muted">
            No badges yet — they unlock as you run more activities.
          </p>
        )}

        {visible.map((badge) => (
          <BadgeRow key={badge.key} badge={badge} />
        ))}

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-[17px] font-bold text-ink"
          >
            {showAll ? 'Show less' : 'View all'}
            <ChevronRightIcon
              className={`h-4 w-4 text-muted transition-transform ${showAll ? '-rotate-90' : ''}`}
            />
          </button>
        )}
      </Card>
    </Section>
  )
}

function BadgeRow({ badge }: { badge: Badge }) {
  const art = BADGE_ART[badge.key] ?? BADGE_FALLBACK

  return (
    <div className={`flex items-center gap-4 p-4 ${badge.earned ? '' : 'opacity-45 grayscale'}`}>
      <div
        className={`flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[14px] text-[30px] ${art.bg}`}
        aria-hidden="true"
      >
        {art.emoji}
      </div>
      <div className="min-w-0">
        <div className="text-[17px] font-bold leading-snug text-ink">{badge.title}</div>
        <div className="text-[15px] leading-snug text-muted">
          {badge.earned
            ? badge.description
            : `${badge.description} — ${badge.progress} of ${badge.target}`}
        </div>
      </div>
    </div>
  )
}
