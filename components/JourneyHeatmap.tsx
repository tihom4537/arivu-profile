'use client'

import { useMemo, useState } from 'react'
import type { ProfilePayload, Submission } from '@/lib/api'
import { addDays, formatDate, formatLongDay, heatmapLevel, mondayOf, parseDay, toISODate } from '@/lib/format'
import { Section } from './Section'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// The design's "This year" tab is a 13-column grid of the last 91 days, not a full
// calendar year — 13 weeks reads clearly at 412px where 52 columns would not.
const YEAR_DAYS = 91

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

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
      if (s.date) (map[s.date] ||= []).push(s)
    }
    return map
  }, [submissions])

  const cells = useMemo(() => {
    if (range === 'week') {
      const monday = mondayOf(today)
      return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
    }
    return Array.from({ length: YEAR_DAYS }, (_, i) => addDays(today, -(YEAR_DAYS - 1 - i)))
  }, [range, today])

  return (
    <Section title="Your journey this year">
      <div className="mb-4 flex gap-2">
        {(['week', 'year'] as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRange(r)
              setOpenDay(null)
            }}
            className={`rounded-full border-2 px-[14px] py-1.5 text-[13px] font-semibold ${
              range === r
                ? 'border-tab bg-tab text-white'
                : 'border-line bg-transparent text-muted'
            }`}
          >
            {r === 'week' ? 'This week' : 'This year'}
          </button>
        ))}
      </div>

      {range === 'week' && (
        <div className="mb-1.5 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((label, i) => (
            <span key={i} className="text-center text-[11px] font-bold text-faint">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className={range === 'week' ? 'grid grid-cols-7 gap-1.5' : 'grid grid-cols-[repeat(13,1fr)] gap-1'}>
        {cells.map((d) => {
          const iso = toISODate(d)
          const count = d > today ? 0 : days[iso] ?? 0
          const level = heatmapLevel(count)
          const selected = openDay === iso

          return (
            <button
              key={iso}
              type="button"
              title={`${formatLongDay(d)} — ${count} ${count === 1 ? 'activity' : 'activities'}`}
              onClick={() => count > 0 && setOpenDay(selected ? null : iso)}
              className={`aspect-square ${HEAT[level]} ${
                range === 'week'
                  ? `flex flex-col items-center justify-center gap-0.5 rounded-cell ${
                      level >= 2 ? 'text-white' : 'text-muted'
                    }`
                  : 'rounded-[4px]'
              } ${selected ? 'outline outline-2 outline-offset-2 outline-ink' : ''}`}
            >
              {range === 'week' && (
                <>
                  <span className="text-[15px] font-bold">{d.getDate()}</span>
                  {count > 0 && (
                    <span className="h-1 w-1 rounded-full bg-current opacity-70" />
                  )}
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
