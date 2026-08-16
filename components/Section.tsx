import type { ReactNode } from 'react'

/** Section heading + optional one-line subtitle, used by every block on the page. */
export function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="px-5 py-6">
      <h2 className="text-[21px] font-bold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** The bordered white card that every tile, badge row and feed item sits in. */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-card border border-hairline bg-surface ${className}`}>
      {children}
    </div>
  )
}

/** A number over a grey label — the shape shared by Achievements and Impact. */
export function StatTile({
  value,
  label,
  emoji,
  className = '',
}: {
  value: ReactNode
  label: string
  emoji?: string
  className?: string
}) {
  return (
    <Card className={`flex items-center gap-3 p-4 ${className}`}>
      {emoji && (
        <span className="text-[30px] leading-none" aria-hidden="true">
          {emoji}
        </span>
      )}
      <div className="min-w-0">
        <div className="text-[22px] font-bold leading-tight text-ink">{value}</div>
        <div className="text-[15px] leading-snug text-muted">{label}</div>
      </div>
    </Card>
  )
}
