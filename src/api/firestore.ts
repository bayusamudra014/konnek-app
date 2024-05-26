import "server-only";

import { getFirestore } from "firebase-admin/firestore";
import firebaseAdmin from "@/api/firebase";
import log from "@/lib/logger";

const firestoreAdmin = getFirestore(
  firebaseAdmin,
  process.env.FIRESTORE_DB_NAME ?? "app-db"
);

log.debug({
  name: "firestore",
  msg: "firestore_admin_initialized",
  data: { dbName: process.env.FIRESTORE_DB_NAME },
});
export default firestoreAdmin;
