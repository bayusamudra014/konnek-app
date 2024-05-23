import "server-only";

import { getFirestore } from "firebase-admin/firestore";
import firebaseAdmin from "@/api/firebase";

const firestoreAdmin = getFirestore(firebaseAdmin, "app-db");
export default firestoreAdmin;
