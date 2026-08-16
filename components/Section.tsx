import type { ReactNode } from 'react'

/** Section heading + optional subtitle. Sizes follow .section-title / .section-subtitle. */
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
    <section>
      <h2 className="mb-[15px] text-[21px] font-bold leading-[26px]">{title}</h2>
      {subtitle && (
        <p className="-mt-[9px] mb-[15px] text-sm font-medium text-muted">{subtitle}</p>
      )}
      {children}
    </section>
  )
}

/** .stat-card — 2px border, 16px radius, icon left, value over label. */
export function StatCard({
  value,
  label,
  icon,
  className = '',
}: {
  value: ReactNode
  label: string
  icon?: string
  className?: string
}) {
  return (
    <div className={`flex items-start gap-[14px] rounded-lg border-2 border-line p-[17px] ${className}`}>
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" className="max-h-[41px] w-[30px] shrink-0" />
      )}
      <div className="min-w-0">
        <div className="text-[18px] font-bold leading-5">{value}</div>
        <div className="mt-1 text-sm font-medium leading-5 text-faint">{label}</div>
      </div>
    </div>
  )
}
