// src/app/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import TikiChatWidget from '@/components/chatbot/TikiChatWidget';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* 항상 우하단에 떠있게 */}
      <TikiChatWidget />
    </>
  );
}
