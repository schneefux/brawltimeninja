const colors = require('tailwindcss/colors')
const path = require('path')

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV == 'production',
    content: [
      path.join(__dirname, './pages/**/*.vue'),
      path.join(__dirname, './layouts/**/*.vue'),
      path.join(__dirname, './components/**/*.vue'),
      path.join(__dirname, './components/**/*.tsx'),
      path.join(__dirname, './content/**/*.md'),
      path.join(__dirname, 'node_modules/vue-range-component/dist/vue-range-slider.css'), // whitelist all
    ],
    safelist: ['html', 'body', 'nuxt-progress']
  },
  theme: {
    extend: {
      textShadow: {
        'default': '-1px 0 #22292f, 0 1px #22292f, 1px 0 #22292f, 0 -1px #22292f',
      },
      colors: {
        ...colors,
        /*
        // TODO: migrate
        'grey-darkest': colors.gray['800'],
        'grey-darker': colors.gray['700'],
        'grey-dark': colors.gray['600'],
        'grey': colors.gray['500'],
        'grey-light': colors.gray['400'],
        'grey-lighter': colors.gray['300'],
        'grey-lightest': colors.gray['200'],

        'red-lighter': colors.red['300'],

        'primary-darkest': colors.lightBlue['800'],
        'primary-darker': colors.lightBlue['700'],
        'primary-dark': colors.lightBlue['600'],
        'primary': colors.lightBlue['500'],
        'primary-light': colors.lightBlue['400'],
        'primary-lighter': colors.lightBlue['300'],
        'primary-lightest': colors.lightBlue['200'],

        'secondary-darkest': colors.yellow['800'],
        'secondary-darker': colors.yellow['700'],
        'secondary-dark': colors.yellow['600'],
        'secondary': colors.yellow['500'],
        'secondary-light': colors.yellow['400'],
        'secondary-lighter': colors.yellow['300'],
        'secondary-lightest': colors.yellow['200'],
        */

        'grey-darkest': '#3d4852',
        'grey-darker': '#606f7b',
        'grey-dark': '#8795a1',
        'grey': '#b8c2cc',
        'grey-light': '#dae1e7',
        'grey-lighter': '#f1f5f8',
        'grey-lightest': '#f8fafc',

        'red-lighter': '#f9acaa',

        'primary-darkest': '#12283a',
        'primary-darker': '#1c3d5a',
        'primary-dark': '#2779bd',
        'primary': '#3490dc',
        'primary-light': '#6cb2eb',
        'primary-lighter': '#bcdefa',
        'primary-lightest': '#eff8ff',

        'secondary-darkest': '#453411',
        'secondary-darker': '#684f1d',
        'secondary-dark': '#f2d024',
        'secondary': '#ffed4a',
        'secondary-light': '#fff382',
        'secondary-lighter': '#fff9c2',
        'secondary-lightest': '#fcfbeb',

        gray: {
          100: '#f7fafc',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
          800: '#2d3748',
          900: '#1a202c',
        },
      },
      spacing: {
        120: '30rem',
        160: '40rem',
      },
    },
  },
  plugins: [
    // for 'prose'
    require('@tailwindcss/typography'),
    // prettier checkboxes etc.
    // https://tailwindcss-forms.netlify.app/
    require('@tailwindcss/forms'),
    // for text shadows etc.
    require('tailwindcss-typography')({ }),
  ],
}
