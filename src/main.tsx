;(window as any).global = window

// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/index.css';
import App from './app/App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapAuth } from './shared/storage/bootstrapAuth.ts';

const queryClient = new QueryClient();
await bootstrapAuth()
createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  // </StrictMode>,
);