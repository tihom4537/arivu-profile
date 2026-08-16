import type { ProfilePayload } from '@/lib/api'
import { pluralWeeks } from '@/lib/format'
import { Section, StatCard } from './Section'

export function Achievements({ achievements }: { achievements: ProfilePayload['achievements'] }) {
  const { streak_weeks, stars, people_reached, level } = achievements

  return (
    <Section title="Achievements">
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        <StatCard icon="/profile-icons/icon-lightning.svg" value={pluralWeeks(streak_weeks)} label="Streak maintained" />
        <StatCard icon="/profile-icons/icon-stars.svg" value={stars} label="Stars earned" />
        <StatCard
          icon="/profile-icons/icon-people-impacted.svg"
          value={people_reached}
          label="People reached"
          className="col-span-2"
        />
      </div>

      <div className="mt-3 flex items-center gap-4 rounded-lg border-2 border-line px-5 py-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile-icons/belaku-level.png" alt="" className="w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold">
            Level {level.level} · {level.name}
          </div>
          <div className="mt-0.5 text-sm font-medium text-faint">
            {level.stars_to_next === null
              ? 'Highest level reached'
              : `${level.stars_to_next} more stars to reach Level ${level.level + 1}`}
          </div>
          <div
            className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={level.progress_pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffb800] to-[#ff8a3d]"
              style={{ width: `${level.progress_pct}%` }}
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
