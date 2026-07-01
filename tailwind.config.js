/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    // Editorial system: warm-gray canvas, near-black ink, hairlines. Emphasis
    // comes from scale and weight, never colour. Radii and shadows are removed
    // at the theme level so no utility can reintroduce them.
    extend: {
      colors: {
        surface: {
          base: '#f4f4f2', // warm-gray canvas
          raised: '#f4f4f2', // no elevation — same as canvas
          overlay: '#efefec', // recessed surface (menus/palette)
          hover: '#ecece8', // faint hover wash
          border: '#e7e7e3', // soft hairline
          rule: '#c9c9c4' // quiet hairline
        },
        content: {
          primary: '#0a0a0a', // near-black ink
          secondary: '#6b6b68', // metadata / captions
          tertiary: '#8a8a86', // placeholders / quiet
          inverse: '#f4f4f2'
        },
        // "accent" maps to ink — there is no colour accent in the system.
        accent: {
          DEFAULT: '#0a0a0a',
          muted: '#6b6b68',
          soft: 'rgba(10, 10, 10, 0.06)'
        },
        // Natural-event category colours — the only colour in the product,
        // treated as data. Muted, warm-neutral, and legible on warm-gray.
        event: {
          wildfire: '#d1461f',
          volcano: '#b3271a',
          flood: '#2e6fb0',
          storm: '#5a45b8',
          seaice: '#2a8f8f',
          dust: '#a9772f',
          earthquake: '#a67c1a',
          landslide: '#7a4a28',
          snow: '#7d8ba0',
          drought: '#9a6a24',
          temperature: '#c85a2a',
          water: '#227a8a',
          other: '#6b6b68'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'Helvetica Neue',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'system-ui',
          'sans-serif'
        ],
        serif: ['"Cormorant Garamond"', 'Canela', 'Georgia', 'serif'],
        mono: ['SFMono-Regular', 'ui-monospace', 'Menlo', 'Consolas', 'monospace']
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.45' }]
      },
      letterSpacing: {
        meta: '0.16em',
        display: '-0.02em',
        'display-tight': '-0.035em'
      },
      // No rounded corners anywhere; circles (data dots, toggles) opt in via `full`.
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '9999px'
      },
      boxShadow: {
        none: 'none',
        panel: 'none',
        overlay: 'none'
      },
      transitionTimingFunction: {
        quiet: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'reveal-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'fade-in': 'fade-in 240ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        'reveal-up': 'reveal-up 420ms cubic-bezier(0.22, 0.61, 0.36, 1)'
      }
    }
  },
  plugins: []
}
