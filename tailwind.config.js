/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#090b0f',
        panel: '#11151b',
        lime: '#c9ff3f',
        muted: '#9299a6',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      boxShadow: { glow: '0 0 40px rgba(201,255,63,.12)' },
    },
  },
  plugins: [],
}
