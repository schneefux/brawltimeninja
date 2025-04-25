import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'
import { colors as themeColors } from './theme-colors.config.js'

export default {
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

      white: colors.white,
      black: colors.black,
      green: colors.emerald,
      orange: colors.orange,
      red: colors.red,

      background: 'rgba(var(--color-background) / <alpha-value>)',
      contrast: 'rgba(var(--color-contrast) / <alpha-value>)',
      text: 'rgba(var(--color-text) / <alpha-value>)',

      ...themeColors,
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
    plugin(function({ addVariant }) {
      addVariant('progress-bar', ['&::-webkit-progress-bar', '&::progress-bar'])
      addVariant('progress-value', ['&::-webkit-progress-value', '&::progress-value'])
      addVariant('scrollbar', ['&::-webkit-scrollbar', '&::scrollbar'])
    }),
  ],
}
