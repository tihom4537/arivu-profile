import type { Badge } from '@/lib/api'
import { Section } from './Section'

/**
 * Badge artwork is a shield with a portrait laid over it. The overlay's inset differs
 * per portrait — those percentages come straight from the design's .women-icon /
 * .elder-icon / .child-icon rules and are what make each face sit correctly.
 */
const BADGE_ART: Record<string, { shield: string; icon: string; inset: string }> = {
  women_friendly: {
    shield: '/profile-icons/women-shield.svg',
    icon: '/profile-icons/women-icon.svg',
    inset: 'top-[13.49%] left-[5.22%] w-[91.3%] h-[67.46%]',
  },
  elder_friendly: {
    shield: '/profile-icons/elder-shield.svg',
    icon: '/profile-icons/elder-icon.svg',
    inset: 'top-[9.52%] left-[13.04%] w-[73.92%] h-[75.4%]',
  },
  child_friendly: {
    shield: '/profile-icons/child-shield.svg',
    icon: '/profile-icons/child-icon.svg',
    inset: 'top-[15%] left-[13.04%] w-[75.66%] h-[61.98%]',
  },
  youth_friendly: {
    shield: '/profile-icons/proactive-shield.svg',
    icon: '/profile-icons/who-women.svg',
    inset: 'top-[15%] left-[13.04%] w-[75.66%] h-[61.98%]',
  },
  proactive: {
    shield: '/profile-icons/proactive-shield.svg',
    icon: '/profile-icons/proactive-calendar.svg',
    inset: 'top-[7.94%] left-[6.09%] w-[87%] h-[79.36%]',
  },
}

export function BadgeList({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned)

  if (badges.length === 0) return null

  return (
    <Section title="Badges earned" count={earned.length}>
      <div className="overflow-hidden rounded-lg border-2 border-line">
        {earned.length === 0 && (
          <p className="px-5 py-4 text-[15px] font-medium text-muted">
            No badges yet — they unlock as you run more activities.
          </p>
        )}

        {earned.map((badge, i) => (
          <BadgeRow key={badge.key} badge={badge} last={i === earned.length - 1} />
        ))}

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
