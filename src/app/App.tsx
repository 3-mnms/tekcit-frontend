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

        if (isMobile) {
          // 모바일 웹: OS 알림
          if (Notification.permission === "granted") {
            new Notification(title, { body });
          } else {
            console.warn("모바일: 알림 권한 없음");
          }
        } else {
          // PC 웹: alert
          alert(`${title}\n${body}`);
        }
      })
      .catch((err) => console.error("포그라운드 알림 처리 오류:", err));

    return () => {
      subscribed = false; // ✅ unmount 시 cleanup
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      {!noChat && <TikiChatWidget />}
    </>
  );
}
