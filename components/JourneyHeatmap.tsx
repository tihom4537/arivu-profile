'use client'

import { useMemo, useState } from 'react'
import type { ProfilePayload, Submission } from '@/lib/api'
import { addDays, formatDate, formatLongDay, mondayOf, parseDay, toISODate } from '@/lib/format'
import { Section } from './Section'

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Year first and selected by default; month beside it.
const RANGES = [
  { key: 'year', label: 'Yearly' },
  { key: 'month', label: 'Monthly' },
] as const

type Range = (typeof RANGES)[number]['key']

/** Activities in a day, capped at the top of the ramp. */
function level(count: number): number {
  return Math.min(count, HEAT.length - 1)
}

/**
 * One cell per day, shaded by how many activities were submitted that day.
 *
 * The full view runs from the day the librarian joined to today, rather than a fixed
 * window — someone onboarded in June should not open their page to months of empty
 * cells predating them.
 */
export function JourneyHeatmap({
  journey,
  submissions,
}: {
  journey: ProfilePayload['journey']
  submissions: Submission[]
}) {
  const [range, setRange] = useState<Range>('year')
  const [openDay, setOpenDay] = useState<string | null>(null)

  const today = parseDay(journey.today)
  const days = journey.days

  const byDay = useMemo(() => {
    const map: Record<string, Submission[]> = {}
    for (const s of submissions) {
      if (s.date) (map[s.date] ||= []).push(s)
    }
    return map
  }, [submissions])

  const cells = useMemo(() => {
    if (range === 'month') {
      // Whole current month, so it reads as a calendar rather than stopping mid-grid.
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      const out: Date[] = []
      // Pad to Monday so weekday columns line up.
      for (let d = mondayOf(first); d <= last; d = addDays(d, 1)) out.push(d)
      return out
    }

    const start = journey.start ? parseDay(journey.start) : addDays(today, -90)
    const out: Date[] = []
    for (let d = new Date(start); d <= today; d = addDays(d, 1)) out.push(d)
    return out
  }, [range, today, journey.start])

  const monthMode = range === 'month'

  return (
    <Section title="Your journey this year">
      <div className="mb-4 flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => {
              setRange(r.key)
              setOpenDay(null)
            }}
            className={`rounded-full border-2 px-[14px] py-1.5 text-[13px] font-semibold ${
              range === r.key
                ? 'border-tab bg-tab text-white'
                : 'border-line bg-transparent text-muted'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {monthMode && (
        <div className="mb-1.5 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((label, i) => (
            <span key={i} className="text-center text-[11px] font-bold text-faint">
              {label}
            </span>
          ))}
        </div>
      )}

      <div
        className={
          monthMode
            ? 'grid grid-cols-7 gap-1.5'
            : // Fixed-size cells on desktop: stretching 13 columns across a full-width
              // band would produce enormous squares.
              'grid grid-cols-[repeat(auto-fill,minmax(16px,1fr))] gap-1'
        }
      >
        {cells.map((d) => {
          const iso = toISODate(d)
          const outOfMonth = monthMode && d.getMonth() !== today.getMonth()
          const future = d > today
          const count = outOfMonth || future ? 0 : days[iso] ?? 0
          const lvl = level(count)
          const selected = openDay === iso

          // One colour decision rather than two overlapping ones — Tailwind orders
          // utilities by its own rules, not by class-string order.
          const tone =
            outOfMonth || future
              ? 'bg-transparent text-[#c4c4c4] opacity-40'
              : `${HEAT[lvl]} ${lvl >= 2 ? 'text-white' : 'text-muted'}`

          return (
            <button
              key={iso}
              type="button"
              disabled={outOfMonth}
              title={`${formatLongDay(d)} — ${count} ${count === 1 ? 'activity' : 'activities'}`}
              onClick={() => count > 0 && setOpenDay(selected ? null : iso)}
              className={`aspect-square ${tone} ${
                monthMode
                  ? 'flex flex-col items-center justify-center gap-0.5 rounded-cell'
                  : 'rounded-[3px]'
              } ${selected ? 'outline outline-2 outline-offset-2 outline-ink' : ''}`}
            >
              {monthMode && !outOfMonth && (
                <>
                  <span className="text-[15px] font-bold">{d.getDate()}</span>
                  {count > 0 && <span className="h-1 w-1 rounded-full bg-current opacity-70" />}
                </>
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-[30px] text-[13px] font-medium text-muted">
        Every green box means you did some activity that day.
      </p>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-faint">
        <span>Less activities</span>
        {HEAT.map((cls) => (
          <span key={cls} className={`h-3 w-3 rounded-[3px] ${cls}`} />
        ))}
        <span>More activities</span>
      </div>

      {openDay && (
        <div className="mt-4 overflow-hidden rounded-lg border-2 border-line">
          <div className="flex items-center justify-between border-b-2 border-line bg-soft px-5 py-[14px] text-[15px] font-bold">
            <span>{formatDate(openDay)}</span>
            <button
              type="button"
              onClick={() => setOpenDay(null)}
              aria-label="Close"
              className="px-1 text-xl leading-none text-faint"
            >
              ×
            </button>
          </div>
          <div>
            {(byDay[openDay] ?? []).length > 0 ? (
              (byDay[openDay] ?? []).map((s, i, arr) => (
                <div
                  key={s.id}
                  className={`px-5 py-[14px] ${i === arr.length - 1 ? '' : 'border-b-2 border-line'}`}
                >
                  <div className="text-base font-bold">{s.title}</div>
                  {s.tag && <div className="mt-0.5 text-[13px] text-tag-fg">{s.tag}</div>}
                </div>
              ))
            ) : (
              // The feed carries only recent activities, so an older green day can
              // have a count without its details being loaded.
              <div className="px-5 py-5 text-center text-sm text-faint">
                {days[openDay] ?? 0} {(days[openDay] ?? 0) === 1 ? 'activity' : 'activities'} on this day.
              </div>
            )}
          </div>
        </div>
      )}
    </Section>
  )
}
