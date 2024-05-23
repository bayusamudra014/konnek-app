import "server-only";

import { getStorage } from "firebase-admin/storage";
import firebaseAdmin from "@/api/firebase";

const storageAdmin = getStorage(firebaseAdmin);
export default storageAdmin;
