import "server-only";

import {
  initializeApp,
  getApps,
  App,
  applicationDefault,
} from "firebase-admin/app";

let firebaseAdmin: App;

if (getApps().length == 0) {
  firebaseAdmin = initializeApp({
    credential: applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  firebaseAdmin = getApps()[0];
}

export default firebaseAdmin;
