const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`
    }
    return `rgb(var(${variable}) / ${opacityValue})`
  }
}

module.exports = {
  darkMode: 'class',
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
      inherit: 'inherit',

      gray: colors.zinc,
      yellow: colors.amber,
      primary: colors.amber,
      'on-primary': colors.gray['800'],
      red: colors.red,
      secondary: colors.red,
      'on-secondary': colors.gray['200'],

      white: colors.white,
      black: colors.black,
      green: colors.emerald,
      orange: colors.orange,
      blue: colors.blue,
      purple: colors.violet,
      pink: colors.pink,

      background: withOpacityValue('--color-background'),
      contrast: withOpacityValue('--color-contrast'),
      text: withOpacityValue('--color-text'),
    },
    extend: {
      fontFamily: {
        sans: ['Roboto Flex', ...defaultTheme.fontFamily.sans],
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
