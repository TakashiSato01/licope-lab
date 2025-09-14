// apps/admin/src/lib/repositories/jobs.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const ORG_ID = "demo-org";

export async function saveJobDraft(form: {
  title: string;
  wage: string;
  description: string;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const col = collection(db, `organizations/${ORG_ID}/jobs`);
  const data = {
    orgId: ORG_ID,
    status: "draft",
    title: form.title,
    wage: form.wage,
    description: form.description,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(col, data);
  return ref.id;
}