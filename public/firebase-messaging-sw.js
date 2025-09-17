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

// ✅ 캐시 무효화 코드: 새 서비스워커가 오면 바로 적용
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ✅ 백그라운드 알림 처리
messaging.onBackgroundMessage((payload) => {
  console.log("📱 백그라운드 알림 도착:", payload);

  const notificationTitle = payload.data?.title || "테킷에서 알림이 도착했습니다.";
  const notificationOptions = {
    body: payload.data?.body || "홈페이지 알림 내역을 참고해주세요!",
    // icon: "/firebase-logo.png", // 필요시 아이콘 추가
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
