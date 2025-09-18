// src/app/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import TikiChatWidget from '@/components/ai/chatbot/TikiChatWidget';
import useNoChatWidget from "@/models/ai/useNoChatWidget";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

export default function App() {
  const noChat = useNoChatWidget();

  useEffect(() => {
    // ✅ 실시간 리스너 등록
    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.data?.title || payload.notification?.title || "알림";
      const body = payload.data?.body || payload.notification?.body || "";

      if (Notification.permission === "granted") {
        try {
          new Notification(title, { body });
        } catch (err) {
          console.warn("Notification API 실패 → alert fallback", err);
          alert(`${title}\n${body}`);
        }
      } else {
        alert(`${title}\n${body}`);
      }
    });

    // ✅ cleanup (메모리 누수 방지)
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      {!noChat && <TikiChatWidget />}
    </>
  );
}

