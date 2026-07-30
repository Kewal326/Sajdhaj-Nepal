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
          50:  '#FBEAF0',
          100: '#F4C0D1',
          200: '#ED93B1',
          400: '#D4537E',
          600: '#993556',
          700: '#7F2E5D',
          800: '#72243E',
          900: '#3D1526',
        },
        gold: {
          400: '#EF9F27',
          800: '#412402',
        },
      },
    },
  },
  plugins: [],
}

export default config
