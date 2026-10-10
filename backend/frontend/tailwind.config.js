/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(251 250 247)',
        foreground: 'rgb(24 59 48)',
        primary: {
          DEFAULT: '#276247',
          light: '#9ac3aa',
        },
        accent: '#d8b87a',
        dark: '#183b30',
        muted: {
          DEFAULT: '#f8f8f8',
          foreground: '#5a6e68',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
