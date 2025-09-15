import React, { useRef, useState } from "react";
import { addLicologPost } from "/src/lib/repositories/licolog";

export default function Composer() {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files || []);
    setFiles(cur => [...cur, ...f].slice(0, 4)); // 最大4枚
    if (inputRef.current) inputRef.current.value = ""; // 同じファイル再選択OK
  };

  const submit = async () => {
    if (!body.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await addLicologPost(body.trim(), files);
      // ★ 成功時は全部クリア
      setBody("");
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6">
      <textarea
        className="w-full rounded-2xl bg-white/5 text-white p-4 min-h-[140px]"
        placeholder="いまどうしてる？（140〜500字）"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex items-center justify-between mt-3">
        <div className="text-white/80">
          <label className="cursor-pointer">
            <span className="mr-3">画像を選択（最大4枚）</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPick}
            />
          </label>
        </div>
        <button
          onClick={submit}
          disabled={busy || !body.trim()}
          className="px-5 py-2 rounded-xl bg-white text-black disabled:opacity-50"
        >
          {busy ? "投稿中…" : "投稿"}
        </button>
      </div>

      {/* 選択中のプレビュー（投稿後は消える） */}
      {files.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {files.map((f, i) => (
            <span key={i} className="text-xs text-white/70 bg-white/10 rounded px-2 py-1" title={f.name}>
              {f.name}
            </span>
          ))}
        </div>
      )}

      {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
    </div>
  );
}