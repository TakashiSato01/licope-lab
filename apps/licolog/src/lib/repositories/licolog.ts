import { db } from "../firebase";
import {
  addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where,
} from "firebase/firestore";

export function listenOrgWall(orgId: string, cb: (docs: any[]) => void) {
  const q = query(
    collection(db, "organizations", orgId, "licologPosts"),
    // MVPでは internal も含めてOK（法人内）
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addPost(orgId: string, data: any) {
  return addDoc(collection(db, "organizations", orgId, "licologPosts"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
