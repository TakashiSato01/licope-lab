// apps/licolog/src/components/Composer.tsx
import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase"; // ← あなたのパスに合わせて

// いったんハードコード（認証を入れたら claims から取る）
const ORG_ID = "demo-org";
const FACILITY_ID = "demo-facility";

export default function Composer() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;

    setBusy(true);
    try {
      await addDoc(collection(db, `organizations/${ORG_ID}/licologPosts`), {
        body: text.trim(),
        media: [],                     // 画像は後で
        authorUid: "debug-user",       // 認証後に request.auth.uid に置換
        orgId: ORG_ID,
        facilityId: FACILITY_ID,
        status: "pending",             // ★ ここが今回の要件
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("create licolog post failed:", err);
      alert("投稿に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-black/70 p-4 flex gap-2">
      <input
        className="flex-1 rounded-md bg-neutral-900 px-4 py-3 outline-none"
        placeholder="いまの様子を投稿..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={busy || !text.trim()}
        className="rounded-md px-4 py-3 bg-neutral-800 disabled:opacity-50"
      >
        投稿
      </button>
    </form>
  );
}