// apps/admin/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,   // ★ 追加
  signOut,
  connectAuthEmulator,
  User,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase App
const app = initializeApp({
  apiKey: "demo",
  authDomain: "localhost",
  projectId: "licope-lab",
  storageBucket: "licope-lab.appspot.com",
});

// SDK instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Emulators（ローカル）
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectStorageEmulator(storage, "127.0.0.1", 9199);

// 初期化待ち
export function waitAuthReady(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
}

// ★ 追加：メール/パスワードでログイン
export async function emailSignIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ★ 公開LPでも使う匿名ログイン保証
export async function ensureSignedIn(): Promise<void> {
  if (auth.currentUser) return;
  await new Promise<void>((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      async (u) => {
        if (u) { unsub(); resolve(); return; }
        try {
          await signInAnonymously(auth);
          // 次の onAuthStateChanged で resolve
        } catch (e) {
          unsub();
          reject(e);
        }
      },
      reject
    );
  });
}

export function doSignOut(): void {
  signOut(auth).catch(() => {});
}