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

// 백그라운드 알림 처리
messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 알림 도착:", payload);

  if (payload?.data) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: "/firebase-logo.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});