'use client'

import { useMemo, useState } from 'react'
import type { ProfilePayload, Submission } from '@/lib/api'
import { addDays, formatDate, heatmapLevel, mondayOf, parseDay, toISODate } from '@/lib/format'
import { Section } from './Section'

const RAMP = ['bg-leaf-0', 'bg-leaf-1', 'bg-leaf-2', 'bg-leaf-3', 'bg-leaf-4']
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Range = 'week' | 'year'

export function JourneyHeatmap({
  journey,
  submissions,
}: {
  journey: ProfilePayload['journey']
  submissions: Submission[]
}) {
  const [range, setRange] = useState<Range>('week')
  const [openDay, setOpenDay] = useState<string | null>(null)

  const today = parseDay(journey.today)
  const days = journey.days

  const byDay = useMemo(() => {
    const map: Record<string, Submission[]> = {}
    for (const s of submissions) {
      if (!s.date) continue
      ;(map[s.date] ||= []).push(s)
    }
    return map
  }, [submissions])

  const toggleDay = (iso: string) => setOpenDay((cur) => (cur === iso ? null : iso))

  return (
    <Section title="Your journey this year">
      <div className="flex gap-2" role="tablist">
        {(['week', 'year'] as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={range === r}
            onClick={() => {
              setRange(r)
              setOpenDay(null)
            }}
            className={`rounded-full px-5 py-2 text-[15px] font-bold transition-colors ${
              range === r
                ? 'bg-[#4A4A4A] text-white'
                : 'border border-hairline bg-surface text-ink'
            }`}
          >
            {r === 'week' ? 'This week' : 'This year'}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {range === 'week' ? (
          <WeekStrip today={today} days={days} onSelect={toggleDay} selected={openDay} />
        ) : (
          <YearGrid year={journey.year} today={today} days={days} onSelect={toggleDay} selected={openDay} />
        )}
      </div>

      <p className="mt-4 text-[15px] text-muted">
        Every green box means you did some activity that day.
      </p>

      <div className="mt-2 flex items-center gap-2 text-[14px] text-muted">
        <span>Less activities</span>
        {RAMP.map((cls) => (
          <span key={cls} className={`h-4 w-4 rounded-[4px] ${cls}`} />
        ))}
        <span>More activities</span>
      </div>

      {openDay && (
        <DayPanel
          iso={openDay}
          count={days[openDay] ?? 0}
          submissions={byDay[openDay] ?? []}
          onClose={() => setOpenDay(null)}
        />
      )}
    </Section>
  )
}

/** Mon–Sun of the current week, with day numbers — the "This week" tab. */
function WeekStrip({
  today,
  days,
  onSelect,
  selected,
}: {
  today: Date
  days: Record<string, number>
  onSelect: (iso: string) => void
  selected: string | null
}) {
  const monday = mondayOf(today)

  return (
    <div className="grid grid-cols-7 gap-2">
      {WEEKDAYS.map((label, i) => (
        <div key={i} className="text-center text-[14px] font-bold text-muted">
          {label}
        </div>
      ))}
      {WEEKDAYS.map((_, i) => {
        const d = addDays(monday, i)
        const iso = toISODate(d)
        const count = days[iso] ?? 0
        const level = heatmapLevel(count)
        const future = d > today

        // One colour decision, not two overlapping ones — a `text-*` from the future
        // branch and another from the level branch would be a coin toss at build time,
        // since Tailwind orders utilities by its own rules, not by class-string order.
        const tone = future
          ? 'bg-[#FAFAFA] text-[#C4C4C4]'
          : `${RAMP[level]} ${level >= 3 ? 'text-white' : 'text-ink'}`

        return (
          <button
            key={iso}
            type="button"
            onClick={() => count > 0 && onSelect(iso)}
            aria-label={`${formatDate(iso)}: ${count} activities`}
            className={`flex aspect-square flex-col items-center justify-center rounded-[10px] text-[17px] font-bold ${tone} ${
              selected === iso ? 'ring-2 ring-ink ring-offset-1' : ''
            }`}
          >
            {d.getDate()}
            <span
              className={`mt-0.5 h-1 w-1 rounded-full ${count > 0 ? 'bg-current' : 'bg-transparent'}`}
            />
          </button>
        )
      })}
    </div>
  )
}

/** Contribution-graph layout: one column per week, Mon at the top. */
function YearGrid({
  year,
  today,
  days,
  onSelect,
  selected,
}: {
  year: number
  today: Date
  days: Record<string, number>
  onSelect: (iso: string) => void
  selected: string | null
}) {
  const weeks = useMemo(() => {
    const start = mondayOf(new Date(year, 0, 1))
    const end = new Date(year, 11, 31)
    const out: Date[][] = []

    for (let cursor = start; cursor <= end; cursor = addDays(cursor, 7)) {
      out.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)))
    }
    return out
  }, [year])

  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <div className="inline-flex min-w-full flex-col gap-1">
        {/* Month labels sit above the week whose Monday starts that month. */}
        <div className="flex gap-1">
          {weeks.map((week, i) => {
            const first = week[0]
            const showLabel = first.getDate() <= 7 && first.getFullYear() === year
            return (
              <div key={i} className="w-[13px] text-[10px] leading-none text-muted">
                {showLabel ? MONTH_LABELS[first.getMonth()] : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-1">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((d) => {
                const iso = toISODate(d)
                const inYear = d.getFullYear() === year
                const count = days[iso] ?? 0

                if (!inYear || d > today) {
                  return <span key={iso} className="h-[13px] w-[13px] rounded-[3px] bg-[#FAFAFA]" />
                }
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => count > 0 && onSelect(iso)}
                    aria-label={`${formatDate(iso)}: ${count} activities`}
                    className={`h-[13px] w-[13px] rounded-[3px] ${RAMP[heatmapLevel(count)]} ${
                      selected === iso ? 'ring-2 ring-ink' : ''
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** What happened on the tapped day. */
function DayPanel({
  iso,
  count,
  submissions,
  onClose,
}: {
  iso: string
  count: number
  submissions: Submission[]
  onClose: () => void
}) {
  return (
    <div className="mt-4 rounded-card border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <span className="text-[15px] font-bold text-ink">{formatDate(iso)}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="px-1 text-[20px] leading-none text-muted"
        >
          ×
        </button>
      </div>

      <div className="divide-y divide-hairline">
        {submissions.length > 0 ? (
          submissions.map((s) => (
            <div key={s.id} className="px-4 py-3">
              <div className="text-[16px] font-bold text-ink">{s.title}</div>
              {s.tag && <div className="text-[14px] text-leaf-tag">{s.tag}</div>}
            </div>
          ))
        ) : (
          // The feed carries only the most recent activities, so an older day can be
          // green without its details being loaded.
          <div className="px-4 py-3 text-[15px] text-muted">
            {count} {count === 1 ? 'activity' : 'activities'} on this day.
          </div>
        )}
      </div>
    </div>
  )
}
