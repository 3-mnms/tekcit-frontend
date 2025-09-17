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

        const title = payload.data?.title || payload.notification?.title || "알림";
        const body = payload.data?.body || payload.notification?.body || "";

        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

        if (Notification.permission === "granted") {
          // ✅ 모바일/PC 구분 없이 OS 알림 우선
          new Notification(title, { body });
        } else {
          // ✅ 권한 없으면 alert()로 fallback
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
