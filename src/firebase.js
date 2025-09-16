// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBJ9T7mt7CtwZm1E89qLK-1XeRitcwV-Es",
  authDomain: "fcmtest-bd402.firebaseapp.com",
  projectId: "fcmtest-bd402",
  storageBucket: "fcmtest-bd402.firebasestorage.app",
  messagingSenderId: "603915203012",
  appId: "1:603915203012:web:fb00e2ef0dab3fb51ef491",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 토큰 요청
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BF5YpNLRHPs9tJiv-Se3mIj4ORE7PdZ_q761BsWXCivfkYmMYFGsR1PDNTlKKZ1ho6r3s-79LWUaYF3Px2EQu6Q",
    });
    if (currentToken) {
      console.log("FCM Registration Token:", currentToken);
    } else {
      console.log("No registration token available.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token.", err);
  }
};

// 포그라운드 메시지 리스너
export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    try {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } catch (err) {
      reject(err);
    }
  });
