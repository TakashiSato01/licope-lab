import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, connectFirestoreEmulator, query, orderBy, Timestamp } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(cfg);
export const auth = getAuth(app);
export const db = getFirestore(app);

// DEVかつ明示フラグONの時だけエミュ
if (import.meta.env.DEV && String(import.meta.env.VITE_USE_EMULATORS) === "1") {
  const [fh, fp] = String(import.meta.env.VITE_FIRESTORE_EMULATOR_HOST).split(":");
  connectFirestoreEmulator(db, fh, Number(fp));
  connectAuthEmulator(auth, `http://${import.meta.env.VITE_AUTH_EMULATOR_HOST}`);
}

export async function ensureAuth() {
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
            console.log("✅ Authenticated anonymously");
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
            throw error;
        }
    }
    return auth.currentUser;
}

export async function createJob(input: { title: string; wage: number }) {
    const user = await ensureAuth();
    if (!user) throw new Error("Authentication failed.");
  
    const newJobData = {
        title: input.title,
        wage: input.wage,
        createdAt: Timestamp.now(), // Date.now()から変更
        ownerUid: user.uid
    };
    console.log("✍️ Creating job:", newJobData);
    return addDoc(collection(db, "jobs"), newJobData);
}

export async function listJobs() {
    await ensureAuth();
    console.log("🔄 Fetching jobs...");
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("📊 Fetched jobs:", jobs);
    return jobs;
}