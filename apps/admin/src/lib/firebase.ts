// apps/admin/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  connectAuthEmulator, User
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const app = initializeApp({
  apiKey: "demo",
  authDomain: "localhost",
  projectId: "licope-lab",
  storageBucket: "licope-lab.appspot.com",
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Emulator 接続
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectStorageEmulator(storage, "127.0.0.1", 9199);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

// --- ヘルパ ---
export function waitAuthReady(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
  });
}
export function emailSignIn(email: string, pw: string) {
  return signInWithEmailAndPassword(auth, email, pw);
}
export function doSignOut() {
  return signOut(auth);
}