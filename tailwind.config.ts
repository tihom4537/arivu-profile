import type { Config } from 'tailwindcss'

/**
 * Tokens lifted from the profile design: light surface, hairline card borders,
 * near-black values over grey labels, green for anything activity-related, amber for
 * the avatar ring and the level progress bar.
 */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#212121',
        muted: '#757575',
        hairline: '#E8E8E8',
        placeholder: '#B0B0B0',
        surface: '#FFFFFF',
        canvas: '#FAFAFA',
        amber: { DEFAULT: '#F5C33B', deep: '#EE8A2E' },
        leaf: {
          tag: '#2E7D4F',
          tagBg: '#E8F5EC',
          // Heatmap ramp, level 0 → 4.
          0: '#F1F1F1',
          1: '#C8E6C9',
          2: '#94D19A',
          3: '#4F9A5E',
          4: '#2C6B3B',
        },
      },
      borderRadius: { card: '12px' },
      maxWidth: { page: '720px' },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Noto Sans Kannada', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
