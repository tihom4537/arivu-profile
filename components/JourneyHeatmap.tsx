'use client'

import { useMemo, useState } from 'react'
import type { ProfilePayload, Submission, JourneyWeek } from '@/lib/api'
import { formatDate, formatWeekRange, parseDay } from '@/lib/format'
import { Section } from './Section'

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

// Year first, month beside it — the year is the default view.
const RANGES = [
  { key: 'year', label: 'This year' },
  { key: 'month', label: 'This month' },
] as const

type Range = (typeof RANGES)[number]['key']

/**
 * A cell per ISO week, coloured by how active the librarian was on WhatsApp that week.
 *
 * Weeks rather than days because that is the unit the active-librarian metric is
 * defined in: silent at 0 incoming messages, active at 1-9, power user at 10+. A day
 * is not something those thresholds can classify.
 */
export function JourneyHeatmap({
  journey,
  submissions,
}: {
  journey: ProfilePayload['journey']
  submissions: Submission[]
}) {
  const [range, setRange] = useState<Range>('year')
  const [openWeek, setOpenWeek] = useState<string | null>(null)

  const today = parseDay(journey.today)
  const weeks = journey.weeks ?? []

  // Activities are still keyed by day; group them by week so a cell can show what
  // actually happened that week.
  const activitiesByWeek = useMemo(() => {
    const map: Record<string, Submission[]> = {}
    for (const s of submissions) {
      if (!s.date) continue
      const d = parseDay(s.date)
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      const key = d.toISOString().slice(0, 10)
      ;(map[key] ||= []).push(s)
    }
    return map
  }, [submissions])

  const visible = useMemo(() => {
    if (range === 'year') return weeks
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    return weeks.filter((w) => {
      const end = parseDay(w.week_start)
      end.setDate(end.getDate() + 6)
      // A week belongs to the month if any of its days fall inside it.
      return end >= firstOfMonth && parseDay(w.week_start) <= today
    })
  }, [range, weeks, today])

  if (weeks.length === 0) return null

  const selected = visible.find((w) => w.week_start === openWeek)

  return (
    <Section title="Your journey this year">
      <div className="mb-4 flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => {
              setRange(r.key)
              setOpenWeek(null)
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

      <div
        className={
          range === 'month'
            ? // A month is only four or five cells, so they get room to breathe and
              // carry their own date range.
              'grid grid-cols-2 gap-2 sm:grid-cols-5'
            : 'grid grid-cols-[repeat(13,1fr)] gap-1 md:grid-cols-[repeat(auto-fill,minmax(28px,1fr))]'
        }
      >
        {visible.map((w) => (
          <WeekCell
            key={w.week_start}
            week={w}
            wide={range === 'month'}
            selected={openWeek === w.week_start}
            onSelect={() => setOpenWeek(openWeek === w.week_start ? null : w.week_start)}
          />
        ))}
      </div>

      <p className="mt-[30px] text-[13px] font-medium text-muted">
        Each box is one week, shaded by how active you were on WhatsApp that week.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-faint">
        <span>Silent</span>
        {HEAT.map((cls) => (
          <span key={cls} className={`h-3 w-3 rounded-[3px] ${cls}`} />
        ))}
        <span>Power user</span>
      </div>

      {selected && (
        <WeekPanel
          week={selected}
          activities={activitiesByWeek[selected.week_start] ?? []}
          onClose={() => setOpenWeek(null)}
        />
      )}
    </Section>
  )
}

function WeekCell({
  week,
  wide,
  selected,
  onSelect,
}: {
  week: JourneyWeek
  wide: boolean
  selected: boolean
  onSelect: () => void
}) {
  const title = `${formatWeekRange(week.week_start)} — ${week.incoming} incoming ${
    week.incoming === 1 ? 'message' : 'messages'
  } (${week.label})`

  if (wide) {
    return (
      <button
        type="button"
        title={title}
        onClick={onSelect}
        className={`flex flex-col items-start gap-1 rounded-cell p-3 text-left ${HEAT[week.level]} ${
          week.level >= 2 ? 'text-white' : 'text-muted'
        } ${selected ? 'outline outline-2 outline-offset-2 outline-ink' : ''}`}
      >
        <span className="text-[13px] font-bold">{formatWeekRange(week.week_start)}</span>
        <span className="text-[11px] font-medium capitalize opacity-90">{week.label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onSelect}
      className={`aspect-square rounded-[4px] md:max-w-[32px] ${HEAT[week.level]} ${
        selected ? 'outline outline-2 outline-offset-2 outline-ink' : ''
      }`}
    />
  )
}

function WeekPanel({
  week,
  activities,
  onClose,
}: {
  week: JourneyWeek
  activities: Submission[]
  onClose: () => void
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border-2 border-line">
      <div className="flex items-center justify-between border-b-2 border-line bg-soft px-5 py-[14px] text-[15px] font-bold">
        <span>
          {formatWeekRange(week.week_start)}
          <span className="ml-2 font-medium capitalize text-muted">
            · {week.label} · {week.incoming} messages
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="px-1 text-xl leading-none text-faint"
        >
          ×
        </button>
      </div>
      <div>
        {activities.length > 0 ? (
          activities.map((s, i, arr) => (
            <div
              key={s.id}
              className={`px-5 py-[14px] ${i === arr.length - 1 ? '' : 'border-b-2 border-line'}`}
            >
              <div className="text-base font-bold">{s.title}</div>
              <div className="mt-0.5 text-[13px] text-muted">
                {s.tag && <span className="text-tag-fg">{s.tag}</span>}
                {s.tag && s.date && ' · '}
                {s.date && formatDate(s.date)}
              </div>
            </div>
          ))
        ) : (
          // The feed only carries recent activities, so an older week can be lit up by
          // messages without its activities being loaded here.
          <div className="px-5 py-5 text-center text-sm text-faint">
            No activities recorded for this week.
          </div>
        )}
      </div>
    </div>
  )
}
