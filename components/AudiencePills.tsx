import type { ProfilePayload } from '@/lib/api'
import { Section } from './Section'

// Round portrait per audience, from the design's icon set.
const PILL_ICON: Record<string, string> = {
  children: '/profile-icons/child-icon.svg',
  adolescents: '/profile-icons/child-icon.svg',
  youth: '/profile-icons/who-women.svg',
  women: '/profile-icons/who-women.svg',
  elders: '/profile-icons/who-senior.svg',
}

/**
 * Who the library's activities have been for.
 *
 * These counts intentionally over-sum against "people reached": an activity tagged
 * Children + Women + Seniors credits its headcount to all three, because the form
 * does not split the number by group.
 */
export function AudiencePills({ audiences }: { audiences: ProfilePayload['audiences'] }) {
  if (audiences.length === 0) return null

  return (
    <Section title="Who is using the library?" subtitle="Keep the library useful for different people.">
      <div className="flex flex-wrap gap-2.5">
        {audiences.map((a) => (
          <div key={a.key} className="flex items-center gap-2 rounded-full bg-pill py-2 pl-2 pr-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PILL_ICON[a.key] ?? '/profile-icons/icon-people.svg'}
              alt=""
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <span className="text-[15px] font-bold text-ink">
              {a.label} <span className="text-count-fg">{a.count}</span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}
