import type { ProfilePayload } from '@/lib/api'
import { AUDIENCE_EMOJI } from './art'
import { Section } from './Section'

/**
 * Who the library's activities have been for.
 *
 * These counts intentionally over-sum against "people reached": a report tagged
 * Children + Women + Seniors credits its headcount to all three, because the form
 * doesn't split the number by group.
 */
export function AudiencePills({ audiences }: { audiences: ProfilePayload['audiences'] }) {
  if (audiences.length === 0) return null

  return (
    <Section
      title="Who is using the library?"
      subtitle="Keep the library useful for different people."
    >
      <div className="flex flex-wrap gap-3">
        {audiences.map((a) => (
          <div
            key={a.key}
            className="flex items-center gap-2 rounded-full bg-[#F1F1F1] py-2 pl-2 pr-4"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[18px]"
              aria-hidden="true"
            >
              {AUDIENCE_EMOJI[a.key] ?? '🙂'}
            </span>
            <span className="text-[16px] font-bold text-ink">
              {a.label} {a.count}
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}
