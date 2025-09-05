importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// 1. Firebase 설정 (메인 HTML 파일의 설정과 동일)
const firebaseConfig = {
    apiKey: "AIzaSyBJ9T7mt7CtwZm1E89qLK-1XeRitcwV-Es",
    authDomain: "fcmtest-bd402.firebaseapp.com",
    projectId: "fcmtest-bd402",
    storageBucket: "fcmtest-bd402.firebasestorage.app",
    messagingSenderId: "603915203012",
    appId: "1:603915203012:web:fb00e2ef0dab3fb51ef491"
};

// 2. Firebase 앱 초기화
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 백그라운드 메시지를 받았습니다. 원본 페이로드:', payload);

    // 'notification'이 아닌 'data'에서 정보를 꺼냅니다.
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: '/firebase-logo.png'
        //tag: payload.data.tag
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
    console.log('[SW] showNotification 호출이 성공적으로 완료되었습니다.');
});

// 4. FCM 토큰 발급
messaging.getToken({
    vapidKey: 'BF5YpNLRHPs9tJiv-Se3mIj4ORE7PdZ_q761BsWXCivfkYmMYFGsR1PDNTlKKZ1ho6r3s-79LWUaYF3Px2EQu6Q'
}).then((currentToken) => {
    if (currentToken) {
        console.log('FCM Registration Token:', currentToken);
    } else {
        console.log('No registration token available. Request permission to generate one.');
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
});
