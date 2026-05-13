export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'oklch-function': true,
        'color-mix': true,
        'custom-properties': true
      }
    },
    autoprefixer: {},
  },
}