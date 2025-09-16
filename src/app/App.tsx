// src/app/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import TikiChatWidget from '@/components/ai/chatbot/TikiChatWidget';
import useNoChatWidget from "@/models/ai/useNoChatWidget";
import { onMessageListener } from "../firebase";

export default function App() {
  const noChat = useNoChatWidget();

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        if (document.visibilityState === "visible" && payload?.data) {
          console.log("포그라운드 알림 도착:", payload);
          alert(`${payload.data.title}\n${payload.data.body}`);
        }
      })
      .catch((err) => console.error("포그라운드 알림 처리 오류:", err));
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      {!noChat && <TikiChatWidget />}
    </>
  );
}
