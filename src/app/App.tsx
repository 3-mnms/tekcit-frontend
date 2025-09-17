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
    let subscribed = true;

    onMessageListener()
      .then((payload) => {
        if (!subscribed) return;
        console.log("포그라운드 알림 도착:", payload);

        // ✅ data payload 우선 사용
        const title = payload.data?.title || "알림";
        const body = payload.data?.body || "";

        // ✅ OS 알림 권한 있으면 Notification, 없으면 alert
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
      })
      .catch((err) => console.error("포그라운드 알림 처리 오류:", err));

    return () => {
      subscribed = false;
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      {!noChat && <TikiChatWidget />}
    </>
  );
}

