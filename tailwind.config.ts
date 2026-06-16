import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';


const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/buttons/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/controls/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sql/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "parallax-first": 'url("/images/IMG_3668.png")',
        "parallax-second": 'url("/images/hero_image_1.png")',
        "parallax-third": 'url("/images/hero_image_2.png")',
        "section-first": 'url("/images/IMG_3541.jpeg")',
        "section-second": 'url("/images/IMG_3541.jpeg")',
        "section-third": 'url("/images/IMG_3541.jpeg")',
        "glitter": 'url("/images/cleaningDog.png")',
        "resultsImage": 'url("/images/cleaningUnderCouch.png")',
        "easyProcessImage": 'url("/images/givingPaw.png")',
        "newsImage": 'url("/images/jobs/jobs_1.png")',
        "services": 'url("/images/IMG_3675.jpeg")',
        "jobs": 'url("/images/jobs/jobs_1.png");',

      },
      textShadow: {
        sm: '1px 1px 2px var(--tw-shadow-color)',
        DEFAULT: '2px 2px 4px var(--tw-shadow-color)',
        lg: '4px 4px 8px var(--tw-shadow-color)',
        xl: '4px 4px 16px var(--tw-shadow-color)',
      },
      fontFamily: {
        sofadi: ['var(--font-sofadi)'],
        inter: ['var(--font-inter)'],
        nanum: ['var(--font-nanum)'],
        sans: ['Inter', 'sans-serif'],
        serif: ['Gelasio', 'serif'],
      },
      colors: {
        parchment: '#F9F7F2',
        walnut: '#2D241E',
        cherry: '#A64B29',
        forest: '#3E4D39',
        slate: '#5A5A5A',
        maple: '#E6DED1',
      }
    },
  },
  safelist: ["dark"],
  plugins: [plugin(function ({ matchUtilities, theme }) {
    matchUtilities(
      {
        'text-shadow': (value) => ({
          textShadow: value,
        }),
      },
      { values: theme('textShadow') }
    )
  })
  ],
  fontFamily: {
      'body': [
        'Gelasio',
        'Nanum_Gothic', 
        'ui-sans-serif', 
        'system-ui', 
        '-apple-system', 
        'system-ui', 
        'Segoe UI', 
        'Roboto', 
        'Helvetica Neue', 
        'Arial', 
        'Noto Sans', 
        'sans-serif', 
        'Apple Color Emoji', 
        'Segoe UI Emoji', 
        'Segoe UI Symbol', 
        'Noto Color Emoji'
      ],
      'sans': [
        'Inter',
        'Nanum_Gothic', 
        'ui-sans-serif', 
        'system-ui', 
        '-apple-system', 
        'system-ui', 
        'Segoe UI', 
        'Roboto', 
        'Helvetica Neue', 
        'Arial', 
        'Noto Sans', 
        'sans-serif', 
        'Apple Color Emoji', 
        'Segoe UI Emoji', 
        'Segoe UI Symbol', 
        'Noto Color Emoji'
      ],
  }
};
export default config;
