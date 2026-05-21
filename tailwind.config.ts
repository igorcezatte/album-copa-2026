import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        copa: {
          bg: 'var(--copa-bg)',
          surface: 'var(--copa-card)',
          card: '#111827',
          border: 'rgba(255,255,255,0.07)',
          gold: '#f5c42e',
          'gold-dark': '#d4a017',
          green: '#22c55e',
          field: '#15a065',
          'field-dark': '#0d8466',
          blue: '#3b6fe0',
          muted: '#64748b',
        },
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.07)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'shimmer-slow': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-60px) scale(0)', opacity: '0' },
        },
      },
      animation: {
        pop: 'pop 0.22s ease-out',
        'fade-in': 'fade-in 0.3s ease-out both',
        shimmer: 'shimmer 1.5s linear infinite',
        'shimmer-slow': 'shimmer-slow 3.5s ease-in-out infinite',
        'count-up': 'count-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        confetti: 'confetti 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
