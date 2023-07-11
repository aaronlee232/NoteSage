/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,jsx,ts,tsx}', // react-tailwindcss-select
    './node_modules/react-tailwindcss-select/dist/index.esm.js', // react-tailwindcss-select
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        gray: {
          100: '#d7d7d7', // Platinum
          150: '#cbcbcb',
          200: '#b0afae',
          300: '#888786',
          400: '#615f5d',
          500: '#393735', // Jet
          600: '#2e2c2a',
          700: '#222120',
          800: '#171615',
          900: '#0b0b0b',
        },

        red: {
          100: '#fdd1df',
          200: '#fba2bf',
          300: '#fa74a0',
          400: '#f84580',
          500: '#f61760', // Cerise
          600: '#c5124d',
          700: '#940e3a',
          800: '#620926',
          900: '#310513',
        },

        teal: {
          100: '#d8f1f1',
          200: '#b1e2e2',
          300: '#89d4d4',
          400: '#62c5c5',
          500: '#3bb7b7', // Verdigris
          600: '#2f9292',
          700: '#236e6e',
          800: '#184949',
          900: '#0c2525',
        },

        orange: {
          100: '#feedcc',
          200: '#fdda99',
          300: '#fcc866',
          400: '#fbb533',
          500: '#faa300', // Orange
          600: '#c88200',
          700: '#966200',
          800: '#644100',
          900: '#322100',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-dotted-background'),
    require('@tailwindcss/typography'),
  ],
}
