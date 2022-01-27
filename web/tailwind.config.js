const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    'components/**/*.{js,jsx,ts,tsx,vue}',
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.{js,ts}',
    'content/**/*.md',
    'node_modules/@schneefux/klicker/components/**/*.vue',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      gray: colors.zinc,
      yellow: colors.amber,
      primary: colors.amber,
      red: colors.red,
      secondary: colors.red,

      white: colors.white,
      green: colors.emerald,
      orange: colors.orange,
      blue: colors.blue,
      purple: colors.violet,
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
  plugins: [
    // for 'prose'
    require('@tailwindcss/typography'),
    // prettier checkboxes etc.
    // https://tailwindcss-forms.netlify.app/
    require('@tailwindcss/forms'),
  ],
}
