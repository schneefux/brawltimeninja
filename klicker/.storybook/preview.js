import '../index.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  darkMode: {
    current: 'dark',
  },
  backgrounds: {
    default: 'dark',
    values: [
      {
        name: 'dark',
        value: '#18181b', // bg-gray-900
      },
    ],
  },
}
