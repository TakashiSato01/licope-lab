// apps/licolog/src/components/Composer.tsx
import React, { useState } from "react";
import { addLicologPost } from "../lib/repositories/licolog";

export default function Composer() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setBusy(true);
      await addLicologPost(text.trim());
      setText(""); // 成功したら空に
    } catch (e) {
      alert("投稿に失敗しました");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-4 left-4 right-4 flex gap-3">
      <textarea
        className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 p-4"
        placeholder="いまどうしてる？（140〜500字）"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
      />
      <button
        type="submit"
        disabled={busy || !text.trim()}
        className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 disabled:opacity-50"
      >
        {busy ? "送信中…" : "投稿"}
      </button>
    </form>
  );
}