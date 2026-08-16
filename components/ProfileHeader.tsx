import type { Profile } from '@/lib/api'
import { formatMonthYear } from '@/lib/format'

/**
 * Cover photo with the avatar overlapping its lower edge, then name and meta rows.
 * Measurements follow the design's .cover / .avatar / .profile rules.
 */
export function ProfileHeader({ profile }: { profile: Profile }) {
  const place = [profile.district, profile.taluk && `${profile.taluk} Taluk`]
    .filter(Boolean)
    .join('  |  ')

  return (
    <header>
      <div className="relative h-[192px] w-full overflow-hidden">
        {profile.cover_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.cover_photo_url} alt="" className="block h-full w-full object-cover" />
        ) : (
          <div className="hatch flex h-full w-full flex-col items-center justify-center gap-1.5 text-faint">
            <PlaceholderGlyph />
            <span className="px-3 text-xs font-semibold">Library / activity cover photo</span>
          </div>
        )}
      </div>

      {/* -65px lifts the avatar over the cover, as in .profile */}
      <section className="relative z-[1] -mt-[65px] flex flex-col items-center gap-5 border-b-2 border-line px-5 pb-[15px]">
        <div className="relative z-[2] h-[116px] w-[116px] overflow-hidden rounded-full border-[7px] border-amber-ring bg-[#eee]">
          {profile.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="hatch flex h-full w-full items-center justify-center text-faint">
              <PersonGlyph />
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-0.5 text-center">
            <div className="text-[25px] font-bold leading-[34px]">{profile.name}</div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[15px] font-medium leading-5 text-faint">Librarian</span>
              {profile.years_of_service !== null && (
                <>
                  <span className="text-[13px] text-line">|</span>
                  <span className="text-[15px] font-medium leading-5 text-faint">
                    {profile.years_of_service} years of service
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-2">
            {(profile.library_name || place) && (
              <div className="flex items-start gap-2.5 text-[15px] font-medium text-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-location-on.svg" alt="" width={14} height={14} className="mt-[3px] shrink-0" />
                <div className="flex flex-col gap-0.5 text-left">
                  {profile.library_name && <span>{profile.library_name}</span>}
                  {place && <span>{place}</span>}
                </div>
              </div>
            )}
            {profile.member_since && (
              <div className="flex items-center gap-2.5 text-[15px] font-medium text-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-chat.svg" alt="" width={16} height={16} className="shrink-0" />
                <span>Using Arivu Mitra since {formatMonthYear(profile.member_since)}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </header>
  )
}

function PlaceholderGlyph() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-60">
      <path d="M4 16l4.5-6 3.5 4.5 2.5-3L20 16" stroke="#B0B0B0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" stroke="#B0B0B0" strokeWidth="1.6" />
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#B0B0B0" strokeWidth="1.6" />
    </svg>
  )
}

function PersonGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-60">
      <circle cx="12" cy="8" r="4" stroke="#B0B0B0" strokeWidth="1.6" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke="#B0B0B0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
