import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ApplyPage() {
  const { orgId = "", pubId = "" } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contact, setContact] = useState(""); // メール or 電話どちらでも
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !contact) {
      setError("お名前と連絡先は必須です。");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await addDoc(collection(db, `organizations/${orgId}/applications`), {
        orgId,
        jobPubId: pubId,
        name,
        contact,
        message,
        createdAt: serverTimestamp(),
      });
      setDone(true);
      // 完了後は一覧に戻す等お好みで：
      // navigate(`/p/${orgId}/jobs/${pubId}`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="p-6 max-w-xl">
        <h1 className="text-xl font-semibold mb-3">応募を受け付けました</h1>
        <p className="text-sm text-gray-600 mb-6">
          担当者より折り返しご連絡いたします。ありがとうございました。
        </p>
        <Link to={`/p/${orgId}/jobs/${pubId}`} className="underline text-sm">
          求人ページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">応募フォーム</h1>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">お名前（必須）</label>
          <input
            className="w-full rounded-lg border border-black/10 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">連絡先（必須・メールまたは電話）</label>
          <input
            className="w-full rounded-lg border border-black/10 px-3 py-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="example@example.com / 090-xxxx-xxxx"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">メッセージ</label>
          <textarea
            className="w-full min-h-[120px] rounded-lg border border-black/10 px-3 py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="自己紹介、希望の働き方など"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-[#f579a4] text-white disabled:opacity-50"
          >
            {busy ? "送信中…" : "応募する"}
          </button>
          <Link to={`/p/${orgId}/jobs/${pubId}`} className="text-sm underline">
            戻る
          </Link>
        </div>
      </form>
    </div>
  );
}