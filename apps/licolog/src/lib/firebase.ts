// apps/licolog/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const app = initializeApp({
  apiKey: "demo",
  authDomain: "localhost",
  projectId: "licope-lab",
});

export const auth = getAuth(app);
export const db = getFirestore(app);

// Emulator
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);

// 匿名ログインを保証（描画前に await される想定）
export async function ensureSignedIn(): Promise<void> {
  if (auth.currentUser) return;
  await new Promise<void>((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          unsub();
          resolve();
        } else {
          try {
            await signInAnonymously(auth);
          } catch (e) {
            unsub();
            reject(e);
          }
        }
      },
      reject
    );
  });
}