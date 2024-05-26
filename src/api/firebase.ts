import "server-only";

import { initializeApp, getApps, App } from "firebase-admin/app";

let firebaseAdmin: App;

if (getApps().length == 0) {
  firebaseAdmin = initializeApp({
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  firebaseAdmin = getApps()[0];
}

export default firebaseAdmin;
