import "client-only";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const storage = getStorage();

if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR === "true") {
  connectStorageEmulator(storage, "localhost", 9199);
}

export default storage;
