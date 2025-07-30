module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript',
    'prettier',
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
    semi: 'off',
    '@typescript-eslint/semi': 'off',
    quotes: ['warn', 'single'],
  },
}
