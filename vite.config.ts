import { defineConfig } from 'vite'
import path from 'path';

import react from '@vitejs/plugin-react'
import { getEnv } from './src/shared/config/env'

const API_URL = getEnv('API_URL', '')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      {
        find: '@app',
        replacement: path.resolve(__dirname, 'src/app'),
      },
      {
        find: '@components',
        replacement: path.resolve(__dirname, 'src/components'),
      },
      {
        find: '@models',
        replacement: path.resolve(__dirname, 'src/models'),
      },
      {
        find: '@pages',
        replacement: path.resolve(__dirname, 'src/pages'),
      },
      {
        find: '@home',
        replacement: path.resolve(__dirname, 'src/pages/home'),
      },
      {
        find: '@components',
        replacement: path.resolve(__dirname, 'src/components'),
      },
      {
        find: '@models',
        replacement: path.resolve(__dirname, 'src/models'),
      },
      {
        find: '@shared',
        replacement: path.resolve(__dirname, 'src/shared'),
      },
      {
        find: '@assets',
        replacement: path.resolve(__dirname, 'src/shared/assets'),
      },
      {
        find: '@api',
        replacement: path.resolve(__dirname, 'src/shared/api'),
      },
      {
        find: '@storage',
        replacement: path.resolve(__dirname, 'src/shared/storage'),
      },
    ],
  },
  server: {
    proxy: {
      '/api/users': {
        target: API_URL,
        changeOrigin: true,
      },
      '/api/mail': {
        target: API_URL,
        changeOrigin: true,
      },
      '/api/auth/kakao': {
        target: API_URL,
        // changeOrigin: true,
      },
      '/api/festival': {
        target: API_URL,
        // target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/booking': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/api/payments': {
        target: API_URL,
        changeOrigin: true,
      },
    },
  },
})
