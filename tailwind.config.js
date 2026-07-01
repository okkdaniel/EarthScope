/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Restrained neutral interface palette (charcoal / graphite / slate).
        surface: {
          base: '#0b0d10', // deepest background (app shell)
          raised: '#12151a', // panels
          overlay: '#1a1e25', // popovers, menus
          hover: '#222831',
          border: '#2a2f38'
        },
        content: {
          primary: '#e7ebf0',
          secondary: '#9aa3af',
          tertiary: '#6b7280',
          inverse: '#0b0d10'
        },
        accent: {
          DEFAULT: '#4c8bf5', // calm, single UI accent — reserved for interactive affordances
          muted: '#2f5aa8',
          soft: 'rgba(76, 139, 245, 0.12)'
        },
        // Saturated colors reserved exclusively for natural-event categories.
        event: {
          wildfire: '#ff6b35',
          volcano: '#ff3b30',
          flood: '#3aa0ff',
          storm: '#7c5cff',
          seaice: '#3fd6d6',
          dust: '#d6a35c',
          earthquake: '#e0b13a',
          landslide: '#b06a3a',
          snow: '#c9d6e5',
          drought: '#c98a3a',
          water: '#2fb6c9',
          temperature: '#ff8a5c',
          other: '#8a94a3'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'system-ui',
          'sans-serif'
        ],
        mono: ['SFMono-Regular', 'ui-monospace', 'Menlo', 'Consolas', 'monospace']
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }]
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem'
      },
      boxShadow: {
        panel: '0 8px 30px rgba(0, 0, 0, 0.35)',
        overlay: '0 12px 40px rgba(0, 0, 0, 0.5)'
      },
      transitionTimingFunction: {
        // Natural easing curves — no bounce, no elastic (see CLAUDE.md Motion).
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)'
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'slide-in-right': {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-in-right': 'slide-in-right 240ms cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
}
