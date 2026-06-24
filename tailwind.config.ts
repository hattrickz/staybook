import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          DEFAULT: '#1D9E75',
          600: '#0F6E56',
          700: '#085041',
          800: '#04342C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F9FA',
          tertiary: '#F1F3F5',
        },
        ink: {
          primary:   '#111827',
          secondary: '#4B5563',
          tertiary:  '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong:  '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:  '6px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        elevated: '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
