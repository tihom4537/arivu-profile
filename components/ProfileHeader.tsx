import type { Profile } from '@/lib/api'
import { formatMonthYear } from '@/lib/format'
import { ChatIcon, ImagePlaceholderIcon, LocationIcon, PersonPlaceholderIcon } from './icons'

/** Cover photo, avatar, name, and the two meta lines. */
export function ProfileHeader({ profile }: { profile: Profile }) {
  // "Bangalore Nagar | East Taluk" — either half may be missing in the data.
  const place = [profile.district, profile.taluk && `${profile.taluk} Taluk`]
    .filter(Boolean)
    .join('  |  ')

  return (
    <header className="bg-surface">
      <div className="relative h-[180px] sm:h-[240px]">
        {profile.cover_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_photo_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Placeholder label="Library / activity cover photo" />
        )}

        {/* Avatar straddles the cover's bottom edge, as in the design. */}
        <div className="absolute -bottom-[46px] left-1/2 -translate-x-1/2">
          <div className="h-[116px] w-[116px] overflow-hidden rounded-full border-[5px] border-amber bg-[#F1F1F1]">
            {profile.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PersonPlaceholderIcon className="h-8 w-8 text-placeholder" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-[58px] text-center">
        <h1 className="text-[26px] font-bold leading-tight text-ink">{profile.name}</h1>

        <p className="mt-1 text-[15px] text-muted">
          Librarian
          {profile.years_of_service !== null && (
            <>
              <span className="px-2 text-hairline">|</span>
              {profile.years_of_service} years of service
            </>
          )}
        </p>

        <dl className="mt-4 space-y-2 text-[15px] text-ink">
          {(profile.library_name || place) && (
            <div className="flex items-start justify-center gap-2">
              <LocationIcon className="mt-1 h-4 w-4 shrink-0 text-muted" />
              <div className="text-left">
                {profile.library_name && <div>{profile.library_name}</div>}
                {place && <div>{place}</div>}
              </div>
            </div>
          )}
          {profile.member_since && (
            <div className="flex items-center justify-center gap-2">
              <ChatIcon className="h-4 w-4 shrink-0 text-muted" />
              <span>Using Arivu Mitra since {formatMonthYear(profile.member_since)}</span>
            </div>
          )}
        </dl>
      </div>
    </header>
  )
}

/** Diagonal-hatched grey block, matching the mock's empty-photo treatment. */
function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 text-placeholder"
      style={{
        background:
          'repeating-linear-gradient(135deg, #F1F1F1 0 10px, #E9E9E9 10px 20px)',
      }}
    >
      <ImagePlaceholderIcon className="h-8 w-8" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
