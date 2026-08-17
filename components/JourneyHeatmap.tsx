'use client'

import { useMemo, useState } from 'react'
import type { ProfilePayload, Submission } from '@/lib/api'
import { addDays, formatDate, formatLongDay, mondayOf, parseDay, toISODate } from '@/lib/format'
import { Section } from './Section'

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
 * The yearly view is laid out as a contribution graph — a column per week, a row per
 * weekday, month labels along the top — so a long span stays readable. It runs from
 * the day the librarian joined to today, rather than a fixed window.
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
  const monthMode = range === 'month'

  const byDay = useMemo(() => {
    const map: Record<string, Submission[]> = {}
    for (const s of submissions) {
      if (s.date) (map[s.date] ||= []).push(s)
    }
    return map
  }, [submissions])

  /** Yearly: one column per week, Monday at the top. */
  const columns = useMemo(() => {
    const start = mondayOf(journey.start ? parseDay(journey.start) : addDays(today, -90))
    const out: Date[][] = []
    for (let d = new Date(start); d <= today; d = addDays(d, 7)) {
      out.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)))
    }
    return out
  }, [today, journey.start])

  /** Monthly: the whole current month, padded to Monday so the columns line up. */
  const monthCells = useMemo(() => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const out: Date[] = []
    for (let d = mondayOf(first); d <= last; d = addDays(d, 1)) out.push(d)
    return out
  }, [today])

  // A label sits above the first column of each month, as on a contribution graph.
  const monthLabels = useMemo(
    () =>
      columns.map((col, i) => {
        const month = col[0].getMonth()
        if (i > 0 && columns[i - 1][0].getMonth() === month) return ''
        return MONTHS[month]
      }),
    [columns],
  )

  const cellFor = (d: Date, opts: { inMonth?: boolean } = {}) => {
    const iso = toISODate(d)
    const outOfRange = opts.inMonth === false || d > today
    const count = outOfRange ? 0 : days[iso] ?? 0
    return { iso, count, outOfRange, lvl: level(count) }
  }

  const openCell = (iso: string, count: number) => {
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

      {monthMode ? (
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
              const { iso, count, outOfRange, lvl } = cellFor(d, { inMonth })
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!inMonth}
                  title={`${formatLongDay(d)} — ${count} ${count === 1 ? 'activity' : 'activities'}`}
                  onClick={() => openCell(iso, count)}
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-cell ${
                    outOfRange
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
        // Scrolls horizontally rather than shrinking the cells: a year is 52 columns,
        // which will not fit a phone at a legible size.
        <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <div className="inline-flex flex-col gap-1">
            <div className="flex gap-1 md:gap-1.5">
              {monthLabels.map((label, i) => (
                // Fixed to the column width; the text is allowed to overflow to the
                // right, which is what keeps it aligned to the month's first column.
                <span
                  key={i}
                  className="w-[13px] shrink-0 whitespace-nowrap text-[11px] font-semibold leading-none text-faint md:w-7"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex gap-1 md:gap-1.5">
              {columns.map((col, i) => (
                <div key={i} className="flex shrink-0 flex-col gap-1 md:gap-1.5">
                  {col.map((d) => {
                    const { iso, count, outOfRange, lvl } = cellFor(d)
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={outOfRange}
                        title={`${formatLongDay(d)} — ${count} ${count === 1 ? 'activity' : 'activities'}`}
                        onClick={() => openCell(iso, count)}
                        className={`h-[13px] w-[13px] rounded-[3px] md:h-7 md:w-7 md:rounded-[6px] ${
                          outOfRange ? 'bg-transparent' : HEAT[lvl]
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
