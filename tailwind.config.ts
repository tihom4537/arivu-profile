import type { Config } from 'tailwindcss'

/**
 * Tokens taken verbatim from the design's styles.css, so the two can be diffed.
 * Names match the CSS custom properties they came from.
 */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#3c3c3c',        // --text-dark
        muted: '#777777',      // --text-muted
        faint: '#afafaf',      // --text-faint
        line: '#e5e5e5',       // --border
        amber: '#ffb800',      // --accent-yellow
        'amber-ring': '#ffc800', // avatar ring
        leaf: '#4caf50',       // --accent-green
        coral: '#ff5c5c',      // --accent-red
        soft: '#fafafa',       // --bg-soft
        pill: '#f0f0f0',       // who-pill background
        'tag-bg': '#eafaf0',
        'tag-fg': '#1c9a4b',
        'count-fg': '#2c6e40',
        tab: '#5a5a5a',
        // Journey heat ramp, level 0-4.
        heat: {
          0: '#fafafa',
          1: '#cfe8d4',
          2: '#8fcf9c',
          3: '#4f9e63',
          4: '#2c6e40',
        },
      },
      borderRadius: {
        lg: '16px',   // --radius-lg
        md: '12px',   // --radius-md
        cell: '10px',
      },
      borderWidth: { 2: '2px' },
      // The design is a fixed 412px phone column. Wider viewports get the same column,
      // widened only where a grid genuinely benefits (the activity feed).
      maxWidth: { page: '412px', wide: '900px' },
      fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config
