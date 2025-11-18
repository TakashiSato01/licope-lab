// apps/*/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  connectAuthEmulator,
  // signInAnonymously ← もう使わない
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const app = initializeApp({
  apiKey: "demo",
  authDomain: "localhost",
  projectId: "licope-lab",
  storageBucket: "licope-lab.appspot.com",
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Emulators
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectStorageEmulator(storage, "127.0.0.1", 9199);

// 認証状態が確定するまで待つ（勝手にゲストログインしない）
export async function ensureSignedIn(): Promise<void> {
  if (auth.currentUser) return;
  await new Promise<void>((resolve) => {
    const unsub = onAuthStateChanged(auth, () => {
      unsub();
      resolve();
    });
  });
}