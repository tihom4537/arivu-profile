'use client'

import { useState } from 'react'
import type { Submission } from '@/lib/api'
import { formatDate, metaLine } from '@/lib/format'
import { ChevronDownIcon, GroupIcon, ImagePlaceholderIcon } from './icons'
import { Card, Section } from './Section'

// Mobile shows two cards; the wider layout fills two rows of three. Everything else
// is behind "View more" — it is already in the payload, so expanding costs no request.
const INITIAL_MOBILE = 2
const INITIAL_DESKTOP = 6

export function SubmissionFeed({ submissions }: { submissions: Submission[] }) {
  const [expanded, setExpanded] = useState(false)

  if (submissions.length === 0) return null

  const hasMore = submissions.length > INITIAL_MOBILE

  return (
    <Section title="What has been happening here">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {submissions.map((s, i) => (
          <SubmissionCard
            key={s.id}
            submission={s}
            // Cards past the fold stay in the DOM and are hidden by CSS, so the
            // cutoff can differ between mobile and desktop without JS measuring
            // the viewport (and without a layout flash on hydration).
            hidden={!expanded && i >= INITIAL_MOBILE}
            hiddenOnDesktop={!expanded && i >= INITIAL_DESKTOP}
          />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-card border border-hairline bg-surface py-4 text-[17px] font-bold text-ink ${
            submissions.length > INITIAL_DESKTOP ? '' : 'sm:hidden'
          }`}
        >
          {expanded ? 'View less' : 'View more'}
          <ChevronDownIcon
            className={`h-4 w-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </Section>
  )
}

function SubmissionCard({
  submission,
  hidden,
  hiddenOnDesktop,
}: {
  submission: Submission
  hidden: boolean
  hiddenOnDesktop: boolean
}) {
  const visibility = hidden ? (hiddenOnDesktop ? 'hidden' : 'hidden sm:block') : ''

  return (
    <Card className={`overflow-hidden ${visibility}`}>
      <PhotoCarousel photos={submission.photos} title={submission.title} />

      <div className="p-4">
        <h3 className="text-[17px] font-bold leading-snug text-ink">{submission.title}</h3>

        {(submission.footfall_label || submission.audiences.length > 0) && (
          <p className="mt-2 flex items-start gap-2 text-[15px] leading-snug text-muted">
            <GroupIcon className="mt-1 h-4 w-4 shrink-0" />
            <span>{metaLine(submission.footfall_label, submission.audiences)}</span>
          </p>
        )}

        {(submission.tag || submission.date) && (
          <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
            {submission.tag ? (
              <span className="rounded-full bg-leaf-tagBg px-3 py-1 text-[14px] font-bold text-leaf-tag">
                {submission.tag}
              </span>
            ) : (
              <span />
            )}
            <span className="text-[15px] text-muted">{formatDate(submission.date)}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

/** Swipeable photo strip with dot indicators; a single photo shows no dots. */
function PhotoCarousel({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-[#F1F1F1] text-placeholder">
        <ImagePlaceholderIcon className="h-7 w-7" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto scroll-smooth"
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
      >
        {photos.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {photos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {photos.map((src, i) => (
            <span
              key={src}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-4 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
