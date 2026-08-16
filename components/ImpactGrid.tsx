import type { ProfilePayload } from '@/lib/api'
import { Section, StatTile } from './Section'

export function ImpactGrid({ impact }: { impact: ProfilePayload['impact'] }) {
  const tiles = [
    { value: impact.this_week, label: 'Activities this week' },
    { value: impact.this_month, label: 'Activities this month' },
    { value: impact.this_year, label: 'Activities this year' },
    { value: impact.people_reached, label: 'People reached' },
  ]

  return (
    <Section title="Your impact so far">
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <StatTile key={t.label} value={t.value} label={t.label} />
        ))}
      </div>
    </Section>
  )
}
