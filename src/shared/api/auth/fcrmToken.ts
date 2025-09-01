import { messaging, VAPID_KEY } from "@/models/auth/firebaseClient";
import { getToken } from "firebase/messaging";
import { api } from "@/shared/config/axios";

export async function getAndSaveFcmToken(): Promise<string | null> {
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return null;

    await api.post("/users/fcm-token", { token });
    return token;
  } catch (err) {
    console.error("[FCM] 토큰 저장 실패:", err);
    return null;
  }
}
