const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

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
      inherit: 'inherit',

      gray: colors.zinc,
      primary: colors.amber,
      'on-primary': colors.gray['800'],
      secondary: colors.red,
      'on-secondary': colors.gray['200'],

      white: colors.white,
      black: colors.black,
      red: colors.red,
      yellow: colors.yellow,
      green: colors.green,

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
      },
    },
  },
  plugins: [
    // for 'prose'
    require('@tailwindcss/typography'),
    // prettier checkboxes etc.
    // https://tailwindcss-forms.netlify.app/
    require('@tailwindcss/forms'),
    plugin(function({ addVariant }) {
      addVariant('progress-bar', ['&::-webkit-progress-bar', '&::progress-bar'])
      addVariant('progress-value', ['&::-webkit-progress-value', '&::progress-value'])
      addVariant('scrollbar', ['&::-webkit-scrollbar', '&::scrollbar'])
    }),
  ],
}
