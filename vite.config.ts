// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 목적: 브라우저 환경에서 Node 전역(global, process.env) 참조 에러 방지
//      sockjs-client, @stomp/stompjs를 선번들하여 런타임 로딩 이슈 최소화
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',     // 브라우저에서 global 참조를 window로 치환
    'process.env': {},    // 일부 라이브러리의 process.env 참조 무력화
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs'], // 선번들 대상
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
