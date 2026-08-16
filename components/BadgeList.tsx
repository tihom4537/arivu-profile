'use client'

import { useState } from 'react'
import type { Badge } from '@/lib/api'
import { Section } from './Section'

/**
 * Badge artwork is a shield with a portrait laid over it. The overlay's inset differs
 * per portrait — those percentages come straight from the design's .women-icon /
 * .elder-icon / .child-icon rules and are what make each face sit correctly.
 */
const BADGE_ART: Record<string, { shield: string; icon: string; inset: string }> = {
  women_friendly: {
    shield: '/icons/women-shield.svg',
    icon: '/icons/women-icon.svg',
    inset: 'top-[13.49%] left-[5.22%] w-[91.3%] h-[67.46%]',
  },
  elder_friendly: {
    shield: '/icons/elder-shield.svg',
    icon: '/icons/elder-icon.svg',
    inset: 'top-[9.52%] left-[13.04%] w-[73.92%] h-[75.4%]',
  },
  child_friendly: {
    shield: '/icons/child-shield.svg',
    icon: '/icons/child-icon.svg',
    inset: 'top-[15%] left-[13.04%] w-[75.66%] h-[61.98%]',
  },
  youth_friendly: {
    shield: '/icons/proactive-shield.svg',
    icon: '/icons/who-women.svg',
    inset: 'top-[15%] left-[13.04%] w-[75.66%] h-[61.98%]',
  },
  proactive: {
    shield: '/icons/proactive-shield.svg',
    icon: '/icons/proactive-calendar.svg',
    inset: 'top-[7.94%] left-[6.09%] w-[87%] h-[79.36%]',
  },
}

export function BadgeList({ badges }: { badges: Badge[] }) {
  const [showAll, setShowAll] = useState(false)

  const earned = badges.filter((b) => b.earned)
  const visible = showAll ? badges : earned
  const hasMore = earned.length < badges.length

  if (badges.length === 0) return null

  return (
    <Section title="Badges earned">
      <div className="overflow-hidden rounded-lg border-2 border-line">
        {visible.length === 0 && (
          <p className="px-5 py-4 text-[15px] font-medium text-muted">
            No badges yet — they unlock as you run more activities.
          </p>
        )}

        {visible.map((badge, i) => (
          <BadgeRow key={badge.key} badge={badge} last={i === visible.length - 1 && !hasMore} />
        ))}

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-[17px] font-bold text-[#4b4b4b] hover:bg-soft"
          >
            {showAll ? 'Show less' : 'View all'}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-chevron.svg"
              alt=""
              width={10}
              height={16}
              className={showAll ? 'rotate-[270deg] transition-transform' : 'transition-transform'}
            />
          </button>
        )}
      </div>
    </Section>
  )
}

function BadgeRow({ badge, last }: { badge: Badge; last: boolean }) {
  const art = BADGE_ART[badge.key]

  return (
    <div
      className={`flex items-center gap-5 px-5 py-4 ${last ? '' : 'border-b-2 border-line'} ${
        badge.earned ? '' : 'opacity-45 grayscale'
      }`}
    >
      {art && (
        <div className="relative h-[74.5px] w-[68px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art.shield} alt="" className="block h-full w-full" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art.icon} alt="" className={`absolute object-contain ${art.inset}`} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[17px] font-bold">{badge.title}</div>
        <div className="mt-1 text-[15px] font-medium text-muted">
          {badge.earned
            ? badge.description
            : `${badge.description} — ${badge.progress} of ${badge.target}`}
        </div>
      </div>
    </div>
  )
}
