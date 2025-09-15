import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function ApplyPage() {
  const { orgId = "demo-org", pubId = "" } = useParams();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, `organizations/${orgId}/applications`), {
      orgId, jobPubId: pubId, name, contact, message,
      createdAt: serverTimestamp(),
    });
    setDone(true);
  };

  if (done) return <div className="p-6 max-w-xl">応募を受け付けました。ありがとうございました！</div>;

  return (
    <div className="p-6 max-w-xl">
      <div className="text-xl font-bold mb-4">応募フォーム</div>
      <form onSubmit={submit} className="space-y-3 bg-white rounded-2xl p-4 border border-black/5">
        <div>
          <label className="block text-sm mb-1">お名前</label>
          <input className="w-full border rounded-lg px-3 py-2" required value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">連絡先</label>
          <input className="w-full border rounded-lg px-3 py-2" required value={contact} onChange={e=>setContact(e.target.value)} placeholder="メール or 電話" />
        </div>
        <div>
          <label className="block text-sm mb-1">メッセージ（任意）</label>
          <textarea className="w-full border rounded-lg px-3 py-2 min-h-[120px]" value={message} onChange={e=>setMessage(e.target.value)} />
        </div>
        <button className="rounded-xl bg-[#f579a4] text-white px-4 py-2">送信する</button>
      </form>
    </div>
  );
}