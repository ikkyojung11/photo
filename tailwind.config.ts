import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#fff5f7',
          100: '#ffe6eb',
          200: '#fecdd7',
          300: '#fda4b8',
          400: '#fb7193',
          500: '#f43f6e',
          600: '#e11d59',
          700: '#be1248',
          800: '#9f1240',
          900: '#831439',
        }
      }
    },
  },
  plugins: [],
};
export default config;
