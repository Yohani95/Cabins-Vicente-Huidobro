import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        wood: '#8B5E3C',
        sand: '#C2B280',
        olive: '#3E5C4B',
        canvas: '#FAF8F5'
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 6px 24px rgba(0,0,0,0.06)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};

export default config;




