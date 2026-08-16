import type { ProfilePayload } from '@/lib/api'
import { Section, StatCard } from './Section'

/** Four bordered cards, no icons — .stats-grid with .stat-card.no-icon. */
export function ImpactGrid({ impact }: { impact: ProfilePayload['impact'] }) {
  const tiles = [
    { value: impact.this_week, label: 'Activities this week' },
    { value: impact.this_month, label: 'Activities this month' },
    { value: impact.this_year, label: 'Activities this year' },
    { value: impact.people_reached, label: 'People reached' },
  ]

  return (
    <Section title="Your impact so far">
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        {tiles.map((t) => (
          <StatCard key={t.label} value={t.value} label={t.label} />
        ))}
      </div>
    </Section>
  )
}
