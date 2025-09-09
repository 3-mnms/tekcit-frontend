// src/app/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import TikiChatWidget from '@/components/chatbot/TikiChatWidget';
import useNoChatWidget from "@/models/ai/useNoChatWidget";

export default function App() {
  const noChat = useNoChatWidget();

  return (
    <>
      <RouterProvider router={router} />
      {!noChat && <TikiChatWidget />}
    </>
  );
}
