/**
 * Emoji stand-ins for the illustrated icons in the design mock.
 *
 * The mock referenced PNG/SVG assets that we don't have. Emoji render at the right
 * weight and colour on both Android and iOS WhatsApp WebViews and cost no requests.
 * Swap these for real assets in /public/icons when they land — nothing else changes.
 */

export const BADGE_ART: Record<string, { emoji: string; bg: string }> = {
  women_friendly: { emoji: '👩', bg: 'bg-[#F0913C]' },
  elder_friendly: { emoji: '👴', bg: 'bg-[#7CC24A]' },
  child_friendly: { emoji: '👧', bg: 'bg-[#F4B3B3]' },
  youth_friendly: { emoji: '🧑', bg: 'bg-[#6BAFE0]' },
  proactive: { emoji: '📅', bg: 'bg-[#E8544B]' },
}

export const BADGE_FALLBACK = { emoji: '🏅', bg: 'bg-[#B0B0B0]' }

export const AUDIENCE_EMOJI: Record<string, string> = {
  children: '👧',
  adolescents: '🧒',
  youth: '🧑',
  women: '👩',
  elders: '👵',
}
