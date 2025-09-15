// apps/licolog/src/components/PostCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { pathToURL, updateLicologPost } from "/src/lib/repositories/licolog";
import type { LicologPost, LicologMedia } from "/src/lib/repositories/licolog";

type Props = { post: LicologPost; mine?: boolean };

export default function PostCard({ post, mine }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [body, setBody] = useState(post.body ?? "");
  const [existing, setExisting] = useState<
    { path: string; url: string | null; remove: boolean }[]
  >([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // 投稿が変わったらローカル編集状態を初期化
  useEffect(() => {
    setBody(post.body ?? "");
    const medias = (post.media ?? []) as LicologMedia[];
    let cancelled = false;
    Promise.all(
      medias.map(async m => ({
        path: m.path,
        url: await pathToURL(m.path),
        remove: false,
      }))
    ).then(rows => { if (!cancelled) setExisting(rows); });
    return () => { cancelled = true; };
  }, [post.id]);

  const createdAt = useMemo(() => {
    try {
      const d = typeof post.createdAt?.toDate === "function"
        ? post.createdAt.toDate()
        : new Date(post.createdAt);
      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      }).format(d);
    } catch { return "-"; }
  }, [post.createdAt]);

  async function onSave() {
    if (!post.id || saving) return;
    const removePaths = existing.filter(e => e.remove).map(e => e.path);
    if (!window.confirm("この投稿を更新します。保存すると承認待ちに戻ります。")) return;

    setSaving(true);
    try {
      await updateLicologPost(post.id, {
        newBody: body,
        files: newFiles,
        removePaths,
      });
      // 編集終了（購読で最新内容に置き換わる）
      setNewFiles([]);
      setEditing(false);
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs opacity-70 mb-2">
          {createdAt} ／ ステータス: {post.status}
          <span className="ml-2">※保存すると承認待ちに戻ります</span>
        </div>

        <textarea
          className="w-full min-h-[120px] rounded-lg bg-white/10 p-3 outline-none"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="本文を編集"
        />

        {!!existing.length && (
          <>
            <div className="mt-3 text-sm font-semibold">既存の画像</div>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {existing.map((m, i) => (
                <label key={m.path} className="block relative">
                  {m.url ? (
                    <img
                      src={m.url}
                      alt=""
                      className={`w-full h-28 object-cover rounded-lg ${m.remove ? "opacity-40" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-28 rounded-lg bg-white/10 grid place-items-center">no preview</div>
                  )}
                  <input
                    type="checkbox"
                    className="absolute top-2 left-2"
                    checked={m.remove}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setExisting(prev =>
                        prev.map((row, idx) => idx === i ? { ...row, remove: v } : row)
                      );
                    }}
                  />
                  <span className="absolute top-2 left-7 text-xs">
                    {m.remove ? "削除" : "保持"}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}

        <div className="mt-4">
          <label className="inline-block cursor-pointer rounded-lg bg-white/10 px-3 py-2">
            画像を追加
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setNewFiles(prev => prev.concat(files));
                e.currentTarget.value = "";
              }}
            />
          </label>

          {!!newFiles.length && (
            <div className="mt-2 grid grid-cols-3 gap-3">
              {newFiles.map((f, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    className="w-full h-28 object-cover rounded-lg"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                  <button
                    className="absolute top-2 right-2 text-xs bg-black/60 rounded px-2 py-1"
                    onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== idx))}
                  >
                    取消
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            disabled={saving}
            onClick={onSave}
            className={`px-4 py-2 rounded-lg font-semibold ${saving ? "bg-white/30 cursor-not-allowed" : "bg-white text-black"}`}
          >
            保存
          </button>
          <button
            disabled={saving}
            onClick={() => {
              setEditing(false);
              setNewFiles([]);
              setExisting(prev => prev.map(m => ({ ...m, remove: false })));
              setBody(post.body ?? "");
            }}
            className="px-4 py-2 rounded-lg bg-white/10"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  // 閲覧表示
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs opacity-70 mb-2">
        {createdAt} ／ ステータス: {post.status}
      </div>

      <div className="whitespace-pre-wrap">{post.body}</div>

      {!!post.media?.length && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {post.media?.map(m => <Media key={m.path} path={m.path} />)}
        </div>
      )}

      {mine && post.id && (
        <div className="mt-3">
          <button
            className="px-3 py-1.5 rounded-lg bg-white text-black text-sm"
            onClick={() => setEditing(true)}
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}

function Media({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let dead = false;
    pathToURL(path).then(u => { if (!dead) setUrl(u); });
    return () => { dead = true; };
  }, [path]);
  if (!url) return <div className="w-full h-28 rounded-lg bg-white/10" />;
  return <img src={url} alt="" className="w-full h-28 object-cover rounded-lg" />;
}