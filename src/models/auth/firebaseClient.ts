// ✅ 최신 모듈러 API
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBJ9T7mt7CtwZm1E89qLK-1XeRitcwV-Es",
  authDomain: "fcmtest-bd402.firebaseapp.com",
  projectId: "fcmtest-bd402",
  storageBucket: "fcmtest-bd402.firebasestorage.app",
  messagingSenderId: "603915203012",
  appId: "1:603915203012:web:fb00e2ef0dab3fb51ef491",
};

export const VAPID_KEY =
  "BF5YpNLRHPs9tJiv-Se3mIj4ORE7PdZ_q761BsWXCivfkYmMYFGsR1PDNTlKKZ1ho6r3s-79LWUaYF3Px2EQu6Q";

const app = initializeApp(firebaseConfig);

// ✅ messaging 인스턴스
export const messaging = getMessaging(app);
