import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "demo",
  authDomain: "demo",
  projectId: "demo",
  storageBucket: "demo",
  appId: "demo",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// .env などで切り替えてもよし
if (import.meta.env.MODE === "development" && import.meta.env.VITE_USE_EMU !== "false") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
