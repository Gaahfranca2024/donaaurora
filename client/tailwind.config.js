/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          950: '#0f0518', // Keep simplistic for legacy compat if needed, but primary is below
        },
        // Cosmic Twilight Palette
        cosmic: '#0B0A1D',
        twilight: '#1E1B3C',
        nebula: '#2D2A5E',
        amethyst: '#9D4EDD',
        crystal: '#38BDF8',
        gold: '#FBBF24',
        rose: '#EC4899',
        moon: '#E2E8F0',
        mist: '#94A3B8',
        shadow: '#475569'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'], // Keep Playfair as generic serif or swap to Cinzel if loaded
        sans: ['"Inter"', 'sans-serif'],
        mystic: ['"Playfair Display"', 'serif'], // Fallback for now
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'constellation': 'constellation 20s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(157, 78, 221, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(157, 78, 221, 0.8)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        constellation: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
