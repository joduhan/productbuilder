// Firebase 프로젝트 설정값을 아래에 붙여넣으세요.
// Firebase 콘솔(https://console.firebase.google.com) → 프로젝트 설정 → 일반 → "내 앱" → SDK 설정 및 구성에서 확인할 수 있습니다.
// 이 값들은 공개되어도 안전한 클라이언트 식별자입니다 (실제 보안은 Firebase 콘솔의 Authentication/Firestore 보안 규칙에서 설정합니다).

const firebaseConfig={
    apiKey:"YOUR_API_KEY",
    authDomain:"YOUR_PROJECT_ID.firebaseapp.com",
    projectId:"YOUR_PROJECT_ID",
    storageBucket:"YOUR_PROJECT_ID.appspot.com",
    messagingSenderId:"YOUR_SENDER_ID",
    appId:"YOUR_APP_ID"
};

const firebaseEnabled=firebaseConfig.apiKey!=="YOUR_API_KEY";

if(firebaseEnabled){
    firebase.initializeApp(firebaseConfig);
}
