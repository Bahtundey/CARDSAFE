import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light neutral background + white surfaces for a premium fintech feel.
        canvas: '#FAFAF8',
        surface: '#FFFFFF',
        'surface-2': '#F4F4F2',
        // Neutral "ink" scale — black-forward typography, borders, muted fills.
        ink: {
          50: '#F7F7F6',
          100: '#EFEFEE',
          200: '#EAEAEA',
          300: '#D6D6D4',
          400: '#A6A6A4',
          500: '#777777',
          600: '#5A5A58',
          700: '#3B3B3A',
          800: '#242424',
          900: '#1B1B1B',
          950: '#111111',
        },
        // Primary orange brand scale. Used sparingly for CTAs, active states and
        // key highlights — not as a blanket background.
        brand: {
          50: '#FFF4EC',
          100: '#FFE6D1',
          200: '#FFCDA3',
          300: '#FFAC6E',
          400: '#FF8A33',
          500: '#FF6B00',
          600: '#E85D04',
          700: '#C14E03',
          800: '#9C3F02',
          900: '#7A3101',
          950: '#421A00',
        },
        accent: {
          400: '#FF8A33',
          500: '#FF6B00',
          600: '#E85D04',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,17,0.04), 0 8px 24px rgba(17,17,17,0.06)',
        'card-hover': '0 2px 4px rgba(17,17,17,0.05), 0 12px 32px rgba(17,17,17,0.10)',
        glow: '0 0 0 1px rgba(255,107,0,0.22), 0 8px 24px rgba(255,107,0,0.18)',
      },
      backgroundImage: {
        'radial-fade':
          'radial-gradient(1200px 600px at 50% -10%, rgba(255,107,0,0.08), transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
