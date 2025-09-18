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
    console.log("📡 포그라운드 메시지 리스너 등록");

    // ✅ 실시간 리스너 등록
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📩 포그라운드 알림 도착:", payload);

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
      console.log("❌ 포그라운드 메시지 리스너 해제");
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

