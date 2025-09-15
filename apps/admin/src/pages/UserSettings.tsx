import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { updateProfile, updatePassword } from "firebase/auth";

export default function UserSettings() {
  const user = auth.currentUser!;
  const [displayName, setName] = useState(user.displayName ?? "");
  const [pass, setPass] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true); setErr(null); setSaved(null);
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      if (pass) {
        await updatePassword(user, pass);
      }
      setSaved("保存しました。");
    } catch (e:any) {
      setErr(e?.message ?? String(e));
    } finally { setBusy(false); }
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="text-xl font-bold mb-4">ユーザー設定</div>
      <div className="space-y-3 bg-white border border-black/5 rounded-2xl p-4">
        <div>
          <label className="block text-sm mb-1">表示名</label>
          <input className="w-full border rounded-lg px-3 py-2" value={displayName} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">新しいパスワード</label>
          <input className="w-full border rounded-lg px-3 py-2" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="変更しない場合は空のまま" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        {saved && <div className="text-sm text-green-600">{saved}</div>}
        <button onClick={save} disabled={busy} className="rounded-xl bg-[#f579a4] text-white px-4 py-2">
          {busy ? "保存中…" : "保存する"}
        </button>
      </div>
    </div>
  );
}