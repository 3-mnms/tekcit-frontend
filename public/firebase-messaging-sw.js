importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBJ9T7mt7CtwZm1E89qLK-1XeRitcwV-Es",
  authDomain: "fcmtest-bd402.firebaseapp.com",
  projectId: "fcmtest-bd402",
  storageBucket: "fcmtest-bd402.firebasestorage.app",
  messagingSenderId: "603915203012",
  appId: "1:603915203012:web:fb00e2ef0dab3fb51ef491",
};

// 초기화
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ✅ 캐시 무효화
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ✅ 백그라운드 알림 처리
messaging.onBackgroundMessage((payload) => {
  console.log("📱 백그라운드 알림 도착:", payload);

  // notification payload가 있으면 OS가 알아서 알림 표시 → 따로 showNotification 안 함
  if (payload.notification) {
    console.log("OS가 자체적으로 알림 표시 (중복 방지)");
    return;
  }

  // data-only fallback (웹 환경에서만 사용)
  const notificationTitle = payload.data?.title || "테킷에서 공연 알림이 도착했습니다.";
  const notificationOptions = {
    body: payload.data?.body || "홈페이지를 참고해주세요!",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
