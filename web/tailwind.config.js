const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV == 'production',
    content: [
      '~/pages/**/*.vue',
      '~/layouts/**/*.vue',
      '~/components/**/*.{js,jsx,ts,tsx,vue}',
      '~/content/**/*.md',
      'node_modules/vue-range-component/dist/vue-range-slider.css', // whitelist all
    ],
  },
  darkMode: false,
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      gray: colors.gray,
      yellow: colors.yellow,
      red: colors.red,

      white: colors.white,
      green: colors.green,
      orange: colors.orange,
      blue: colors.blue,
      purple: colors.purple,
      pink: colors.pink,
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        120: '30rem',
        160: '40rem',
        180: '50rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  variants: {},
  plugins: [
    // for 'prose'
    require('@tailwindcss/typography'),
    // prettier checkboxes etc.
    // https://tailwindcss-forms.netlify.app/
    require('@tailwindcss/forms'),
  ],
}
