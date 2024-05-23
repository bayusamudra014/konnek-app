import { getStorage } from "firebase-admin/storage";
import firebaseAdmin from "@/api/firebase";

const storage = getStorage(firebaseAdmin);
export default storage;
