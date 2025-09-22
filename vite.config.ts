// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',     
    'process.env': {},   
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs'],
  },
  resolve: {
    alias: [
      { 
        find: '@', 
        replacement: path.resolve(__dirname, 'src') 
      },
      { find: '@app', 
        replacement: path.resolve(__dirname, 'src/app') 
      },
      { find: '@components', 
        replacement: path.resolve(__dirname, 'src/components') 
      },
      { find: '@models', 
        replacement: path.resolve(__dirname, 'src/models') 
      },
      { find: '@pages', 
        replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@home', replacement: path.resolve(__dirname, 'src/pages/home') 

      },
      { find: '@shared', 
        replacement: path.resolve(__dirname, 'src/shared') 
      },
      { find: '@assets', 
        replacement: path.resolve(__dirname, 'src/shared/assets') 
      },
      { find: '@api', 
        replacement: path.resolve(__dirname, 'src/shared/api') 
      },
      { find: '@storage', 
        replacement: path.resolve(__dirname, 'src/shared/storage') 
      },
    ],
  },
})
