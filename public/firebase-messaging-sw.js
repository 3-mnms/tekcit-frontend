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
    // 알림 페이로드 구성
    try {
        // 기존의 알림 표시 로직
        console.log("Push received, trying to show notification with data:", payload.data);
        const notificationTitle = payload.data.title;
        const notificationOptions = {
          body: payload.data.body,
          icon: '/firebase-logo.png'
        };
        self.registration.showNotification(notificationTitle, notificationOptions);

      } catch (error) {
        // 만약 위 try 블록에서 에러가 발생하면, 이 catch 블록이 실행됩니다.
        console.error("Error in onBackgroundMessage: ", error);

        // 에러 내용을 담은 대체 알림을 띄웁니다.
        const errorTitle = '알림 처리 중 에러 발생';
        const errorOptions = {
          body: error.toString(), // 에러 메시지를 알림 내용으로 보여줍니다.
          icon: '/firebase-logo.png' // 에러 아이콘이 있다면 변경해도 좋습니다.
        };
        self.registration.showNotification(errorTitle, errorOptions);
      }
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
