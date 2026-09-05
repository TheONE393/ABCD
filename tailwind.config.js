/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Deep teal / ink-navy primary palette
        primary: {
          50: '#f0f7f9',
          100: '#ddeff3',
          200: '#bfdfe7',
          300: '#91c7d6',
          400: '#5daac1',
          500: '#3c8fa8',
          600: '#2d738a',
          700: '#275e71',
          800: '#1b3f4d',
          900: '#0f2731',
          950: '#07161d',
          // Dedicated dark-mode semantic variants
          dark: {
            DEFAULT: '#0f2731',
            surface: '#122c37',
            border: '#1b3f4d',
            muted: '#275e71',
            text: '#e2f1f5',
          },
        },
        // Warm amber / coral accent palette for CTAs
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          // Dedicated dark-mode semantic variants
          dark: {
            DEFAULT: '#ea580c',
            hover: '#fb923c',
            active: '#f97316',
            muted: '#7c2d12',
            text: '#ffedd5',
          },
        },
        // Full neutral slate-gray scale
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          // Dedicated dark-mode semantic variants
          dark: {
            bg: '#090d16',
            surface: '#0f172a',
            border: '#1e293b',
            muted: '#64748b',
            text: '#f8fafc',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['Lora', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        heading: ['Lora', 'Georgia', 'Cambria', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Spacing & sizing: inherit complete Tailwind defaults
      spacing: {},
    },
  },
  plugins: [],
};
