const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    'components/**/*.{js,jsx,ts,tsx,vue}',
  ],
  safelist: [{
    pattern: /var--/,
    variants: ['sm', 'md', 'lg', 'xl', '2xl'],
  }, {
    pattern: /dashboard/,
  }],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      gray: colors.zinc,
      primary: colors.amber,
      secondary: colors.red,

      white: colors.white,
      red: colors.red,
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        120: '30rem',
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
