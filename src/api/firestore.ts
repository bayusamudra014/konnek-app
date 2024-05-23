import { getFirestore } from "firebase-admin/firestore";
import firebaseAdmin from "@/api/firebase";

const firestore = getFirestore(firebaseAdmin, "app-db");
export default firestore;
