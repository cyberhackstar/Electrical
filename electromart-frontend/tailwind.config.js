/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#10151C',
          light: '#1A2230',
          lighter: '#242E40',
        },
        porcelain: {
          DEFAULT: '#F3F5F7',
          dark: '#E7EBEE',
        },
        copper: {
          DEFAULT: '#C9752E',
          light: '#DB8F4E',
          dark: '#A85F22',
        },
        amber: {
          DEFAULT: '#F2B705',
          dark: '#D6A200',
        },
        teal: {
          DEFAULT: '#1FA98A',
          light: '#25C79F',
          dark: '#178872',
        },
        steel: {
          DEFAULT: '#5B6672',
          light: '#88919B',
          dark: '#3D454F',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'circuit-trace': "linear-gradient(90deg, transparent 0%, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%, transparent 100%)",
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 21, 28, 0.04), 0 4px 12px rgba(16, 21, 28, 0.06)',
        'card-hover': '0 2px 4px rgba(16, 21, 28, 0.06), 0 12px 24px rgba(16, 21, 28, 0.10)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
