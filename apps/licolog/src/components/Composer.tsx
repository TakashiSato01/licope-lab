// apps/licolog/src/Composer.tsx
import { useRef, useState } from "react";
import { addLicologPost, updateLicologPost } from "../lib/repositories/licolog";
import type { LicologPost } from "../lib/types/licolog";

export default function Composer({
  open, onClose, editing,
}: { open: boolean; onClose: () => void; editing?: LicologPost }) {
  const [text, setText] = useState(editing?.body ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const picking = useRef<HTMLInputElement>(null);
  if (!open) return null;

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...f]);
    e.target.value = "";
  };

  const onSubmit = async () => {
    if (!text.trim() && files.length === 0) return;
    if (editing?.id) {
      await updateLicologPost(editing.id, { newBody: text, files });
    } else {
      await addLicologPost(text, files);
    }
    setText(""); setFiles([]); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-[min(640px,92vw)] bg-white rounded-2xl p-4">
        <h3 className="font-semibold mb-2">{editing ? "投稿を編集" : "新規投稿"}</h3>
        <textarea
          rows={5}
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[var(--brand)]"
          placeholder="いまの気持ちや出来事…"
        />
        {!!files.length && (
          <ul className="mt-2 text-xs text-gray-600 space-y-1">
            {files.map((f, i) => <li key={i}>📎 {f.name}</li>)}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="space-x-2">
            <button onClick={()=>picking.current?.click()} className="px-3 py-2 border rounded-lg">
              画像を追加
            </button>
            <input ref={picking} type="file" accept="image/*" multiple hidden onChange={onPick} />
          </div>
          <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border">キャンセル</button>
            <button onClick={onSubmit} className="px-4 py-2 rounded-lg text-white" style={{background:"var(--brand)"}}>
              {editing ? "更新" : "投稿"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}