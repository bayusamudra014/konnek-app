import { getMessaging } from "firebase/messaging";
import firebaseApp from "./firebase";

export const messaging = getMessaging(firebaseApp);
