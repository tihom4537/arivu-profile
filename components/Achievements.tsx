import type { ProfilePayload } from '@/lib/api'
import { pluralWeeks } from '@/lib/format'
import { Card, Section, StatTile } from './Section'

export function Achievements({
  achievements,
}: {
  achievements: ProfilePayload['achievements']
}) {
  const { streak_weeks, stars, people_reached, level } = achievements

  return (
    <Section title="Achievements">
      {/* Streak and stars pair up; people-reached spans the row beneath, as designed. */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile emoji="⚡" value={pluralWeeks(streak_weeks)} label="Streak maintained" />
        <StatTile emoji="⭐" value={stars} label="Stars earned" />
        <StatTile
          emoji="👧"
          value={people_reached}
          label="People reached"
          className="col-span-2"
        />
      </div>

      <LevelCard level={level} />
    </Section>
  )
}

function LevelCard({ level }: { level: ProfilePayload['achievements']['level'] }) {
  return (
    <Card className="mt-3 flex items-center gap-4 p-4">
      <span className="text-[34px] leading-none" aria-hidden="true">
        🔥
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[18px] font-bold text-ink">
          Level {level.level} · {level.name}
        </div>
        <div className="text-[15px] text-muted">
          {level.stars_to_next === null
            ? 'Highest level reached'
            : `${level.stars_to_next} more stars to reach Level ${level.level + 1}`}
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E8E8E8]"
          role="progressbar"
          aria-valuenow={level.progress_pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber to-amber-deep"
            style={{ width: `${level.progress_pct}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
