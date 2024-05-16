import { initializeApp, applicationDefault } from "firebase-admin/app";

const firebaseAdmin = initializeApp({
  credential: applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export default firebaseAdmin;
