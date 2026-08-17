'use client'

import { useMemo, useState } from 'react'
import type { ProfilePayload, Submission } from '@/lib/api'
import { addDays, formatDate, formatLongDay, mondayOf, parseDay, toISODate } from '@/lib/format'
import { Section } from './Section'

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Days per column in the yearly view.
//
// A contribution graph uses 7 — a column per week, a row per weekday. But a few months
// of history is only ~22 columns, and to span a wide screen those cells would have to
// be ~95px, making the block 700px tall. Four rows gives nearly twice the columns, so
// the graph fills the width with chunky cells and stays short. The cost is that a
// column is no longer a calendar week.
const YEAR_ROWS = 4

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
 * Yearly runs from the day the librarian joined to today, in columns with month
 * labels along the top. Monthly is the current month as a weekday calendar.
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

  /** Yearly: consecutive days chunked into fixed-height columns, oldest first. */
  const columns = useMemo(() => {
    const start = journey.start ? parseDay(journey.start) : addDays(today, -90)
    const all: Date[] = []
    for (let d = new Date(start); d <= today; d = addDays(d, 1)) all.push(d)

    const out: Date[][] = []
    for (let i = 0; i < all.length; i += YEAR_ROWS) out.push(all.slice(i, i + YEAR_ROWS))
    return out
  }, [today, journey.start])

  /**
   * Monthly: a fixed 4 weeks from the Monday of the week containing the 1st, so the
   * grid is always a clean 7x4 rather than running to five or six ragged rows.
   */
  const monthCells = useMemo(() => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const start = mondayOf(first)
    return Array.from({ length: 28 }, (_, i) => addDays(start, i))
  }, [today])

  // A label sits above the first column of each month.
  const monthLabels = useMemo(
    () =>
      columns.map((col, i) => {
        const month = col[0].getMonth()
        if (i > 0 && columns[i - 1][0].getMonth() === month) return ''
        return MONTHS[month]
      }),
    [columns],
  )

  const dayInfo = (d: Date, inRange = true) => {
    const iso = toISODate(d)
    const out = !inRange || d > today
    const count = out ? 0 : days[iso] ?? 0
    return { iso, count, out, lvl: level(count) }
  }

  const toggle = (iso: string, count: number) => {
    if (count > 0) setOpenDay(openDay === iso ? null : iso)
  }

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

      {range === 'month' ? (
        <>
          <div className="mb-1.5 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((label, i) => (
              <span key={i} className="text-center text-[11px] font-bold text-faint">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthCells.map((d) => {
              const inMonth = d.getMonth() === today.getMonth()
              const { iso, count, out, lvl } = dayInfo(d, inMonth)
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!inMonth}
                  title={`${formatLongDay(d)} — ${count} ${count === 1 ? 'activity' : 'activities'}`}
                  onClick={() => toggle(iso, count)}
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-cell ${
                    out
                      ? 'bg-transparent text-[#c4c4c4] opacity-40'
                      : `${HEAT[lvl]} ${lvl >= 2 ? 'text-white' : 'text-muted'}`
                  } ${openDay === iso ? 'outline outline-2 outline-offset-2 outline-ink' : ''}`}
                >
                  {inMonth && (
                    <>
                      <span className="text-[15px] font-bold">{d.getDate()}</span>
                      {count > 0 && <span className="h-1 w-1 rounded-full bg-current opacity-70" />}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        // Columns share the width rather than sitting at a fixed size, so the graph
        // fills whatever band it is given. Floored so a long history scrolls on a
        // phone instead of collapsing to slivers, capped so a short one does not
        // stretch into oversized tiles.
        <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <div className="flex min-w-full flex-col gap-1">
            <div className="flex gap-1 md:gap-2">
              {monthLabels.map((label, i) => (
                // Sized to the column; the text overflows to the right, which keeps
                // each label above the column its month begins in.
                <span
                  key={i}
                  className="min-w-[11px] flex-1 whitespace-nowrap text-center text-[11px] font-semibold leading-none text-faint"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex gap-1 md:gap-2">
              {columns.map((col, i) => (
                <div
                  key={i}
                  className="flex min-w-[11px] flex-1 flex-col items-center gap-1 md:gap-2"
                >
                  {Array.from({ length: YEAR_ROWS }, (_, r) => col[r]).map((d, r) => {
                    // The final column can be short; pad it so its cells stay the
                    // same size as every other column's.
                    if (!d) return <span key={`pad-${r}`} className="aspect-square w-full max-w-[40px]" />
                    const { iso, count, out, lvl } = dayInfo(d)
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={out}
                        title={`${formatLongDay(d)} — ${count} ${count === 1 ? 'activity' : 'activities'}`}
                        onClick={() => toggle(iso, count)}
                        className={`aspect-square w-full max-w-[40px] rounded-[3px] md:rounded-[8px] ${
                          out ? 'bg-transparent' : HEAT[lvl]
                        } ${openDay === iso ? 'outline outline-2 outline-offset-1 outline-ink' : ''}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
