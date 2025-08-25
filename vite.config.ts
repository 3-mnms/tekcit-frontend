import { defineConfig } from 'vite'
import path from 'path';

import react from '@vitejs/plugin-react'

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
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
      '/api/mail': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
      '/api/auth/kakao': {
        target: 'http://localhost:10000',
      },
      '/api/festival': {
        target: 'http://localhost:10000',
        // target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/booking': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      },
      '/api/payments': {
        target: 'http://localhost:8081',
      },
      '/api/addresses': {
        target: 'http://localhost:10000',
      },
    },
  },
})
