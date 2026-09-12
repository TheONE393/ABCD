/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // SynBio Berlin Signature Palette
        synbio: {
          navy: '#001f40',
          navyDark: '#001428',
          blue: '#0d3260',
          orange: '#f7941d',
          orangeLight: '#ffaa42',
          orangeHover: '#e07d09',
          tint: '#eaf0fb',
          tintDark: '#0e1a33',
          darkBg: '#070c18',
          darkSurface: '#0f1a30',
          darkBorder: '#1c2d52',
          darkText: '#e2e8f0',
        },
        // Deep teal / ink-navy primary palette
        primary: {
          50: '#f0f7f9',
          100: '#ddeff3',
          200: '#bfdfe7',
          300: '#91c7d6',
          400: '#5daac1',
          500: '#001f40',
          600: '#001730',
          700: '#001021',
          800: '#000a14',
          900: '#00050a',
          950: '#070c18',
        },
        // Warm amber / coral accent palette for CTAs
        accent: {
          50: '#fffaf0',
          100: '#feefc8',
          200: '#fddf91',
          300: '#fcc855',
          400: '#fba822',
          500: '#f7941d',
          600: '#db730b',
          700: '#b05108',
          800: '#8c3f0d',
          900: '#72340e',
          950: '#3e1903',
        },
      },
      fontFamily: {
        heading: ['Urbanist', 'Inter', 'sans-serif'],
        urbanist: ['Urbanist', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
