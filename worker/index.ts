import { onBackgroundMessage } from "firebase/messaging/sw";
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";
import { getToken } from "firebase/messaging";

declare let self: ServiceWorkerGlobalScope;

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = getMessaging(firebaseApp);

console.log(firebaseConfig);

getToken(messaging, {
  vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
}).then(() =>
  onBackgroundMessage(messaging, (payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message",
      payload
    );

    // Customize notification here
    const notificationTitle = "Konnek Messaging";
    self.registration.showNotification(notificationTitle);
  })
);
