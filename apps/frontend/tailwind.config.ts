import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        steam: {
          blue: '#1b2838',
          lightblue: '#2a475e',
          gray: '#c7d5e0',
          darkgray: '#171a21',
        },
      },
    },
  },
  plugins: [],
}
export default config
