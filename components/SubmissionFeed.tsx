'use client'

import { useState } from 'react'
import type { Submission } from '@/lib/api'
import { formatDate, metaLine } from '@/lib/format'
import { Section } from './Section'

// Two cards on mobile, six on desktop, the rest behind "View more".
//
// Six is what keeps the feed level with the sidebar beside it: laid out 2-up they are
// three rows, which lands about where the badges list ends. Stacked one-up they would
// run roughly twice the sidebar's height, which is why the feed goes two columns as
// soon as there is room for it.
//
// The hidden cards stay in the DOM and are hidden by CSS, so the cutoff is a
// breakpoint concern rather than something JS measures — and no hydration flash.
const INITIAL_MOBILE = 2
const INITIAL_DESKTOP = 6

export function SubmissionFeed({ submissions }: { submissions: Submission[] }) {
  const [expanded, setExpanded] = useState(false)

  if (submissions.length === 0) return null
  const hasMore = submissions.length > INITIAL_MOBILE

  return (
    <Section title="What has been happening here">
      <div className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5">
        {submissions.map((s, i) => {
          let hide = ''
          if (!expanded && i >= INITIAL_DESKTOP) hide = 'hidden'
          else if (!expanded && i >= INITIAL_MOBILE) hide = 'hidden md:flex'
          return <SubmissionCard key={s.id} submission={s} className={hide} />
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-line px-5 py-2.5 text-[17px] font-bold text-[#4b4b4b] hover:bg-soft ${
            // Between 3 and 6 activities there is nothing hidden on desktop, so the
            // button would do nothing there.
            submissions.length > INITIAL_DESKTOP ? '' : 'md:hidden'
          }`}
        >
          {expanded ? 'View less' : 'View more'}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/profile-icons/icon-chevron.svg"
            alt=""
            width={10}
            height={16}
            className={expanded ? 'rotate-[270deg]' : 'rotate-90'}
          />
        </button>
      )}
    </Section>
  )
}

function SubmissionCard({
  submission,
  className = '',
}: {
  submission: Submission
  className?: string
}) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-lg border-2 border-line ${className}`}
    >
      <PhotoCarousel photos={submission.photos} title={submission.title} />

      <div className="flex flex-col gap-2 px-5 pb-[18px] pt-4">
        <h3 className="text-base font-bold leading-[22px]">{submission.title}</h3>

        {(submission.footfall_label || submission.audiences.length > 0) && (
          <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/profile-icons/icon-group.svg" alt="" width={16} height={14} className="shrink-0" />
            <span>{metaLine(submission.footfall_label, submission.audiences)}</span>
          </p>
        )}

        {(submission.tag || submission.date) && (
          <div className="mt-1.5 flex items-center justify-between border-t border-line pt-2.5">
            {submission.tag ? (
              <span className="rounded-full bg-tag-bg px-2.5 py-1 text-xs font-bold text-tag-fg">
                {submission.tag}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs font-medium text-faint">{formatDate(submission.date)}</span>
          </div>
        )}
      </div>
    </article>
  )
}

/** Swipeable photo strip with dot indicators; a single photo shows no dots. */
function PhotoCarousel({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="hatch flex h-[160px] w-full items-center justify-center text-faint md:h-[220px] lg:h-[180px]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-60">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="#B0B0B0" strokeWidth="1.6" />
          <circle cx="8" cy="8" r="2" stroke="#B0B0B0" strokeWidth="1.6" />
          <path d="M4 16l4.5-6 3.5 4.5 2.5-3L20 16" stroke="#B0B0B0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative h-[160px] w-full bg-[#eee] md:h-[220px] lg:h-[180px]">
      <div
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
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
            className="block h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {photos.length > 1 && (
        <div className="pointer-events-none absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-[5px]">
          {photos.map((src, i) => (
            <span
              key={src}
              className={`block h-1.5 w-1.5 rounded-full ${
                i === index ? 'bg-white' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
