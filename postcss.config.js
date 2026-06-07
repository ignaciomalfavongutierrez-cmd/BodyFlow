export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'oklab-function': true,
        'color-mix': true,
        'custom-properties': true
      }
    },
    autoprefixer: {},
  },
}