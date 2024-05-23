import "server-only";
import { getMessaging } from "firebase-admin/messaging";

const messagingAdmin = getMessaging();
export default messagingAdmin;
