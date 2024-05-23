import "server-only";
import { initializeApp } from "firebase-admin/app";

const firebaseAdmin = initializeApp();

export default firebaseAdmin;
