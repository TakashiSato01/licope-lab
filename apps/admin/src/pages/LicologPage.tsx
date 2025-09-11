import React, { useEffect, useState } from "react";
import {
  subscribePendingLicologPosts,
  bulkApproveLicologPosts,
  type AdminLicologPost,
} from "@/lib/repositories/licolog";

export default function LicologPage() {
  const [posts, setPosts] = useState<AdminLicologPost[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // 承認待ち一覧をウォールとして購読
    return subscribePendingLicologPosts(setPosts);
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allChecked = posts.length > 0 && selected.size === posts.length;
  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === posts.length ? new Set() : new Set(posts.map((p) => p.id))
    );
  };

  const handleApprove = async () => {
    if (selected.size === 0) return;
    if (!window.confirm("チェックを付けたリコログを公開します。よろしいですか？")) return;

    try {
      setBusy(true);
      await bulkApproveLicologPosts(Array.from(selected));
      setSelected(new Set());
      alert("公開しました。");
    } catch (e: any) {
      console.error(e);
      alert(`公開に失敗しました: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">リコログ承認</h1>

      <div className="mb-2 flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          <span>全選択 / 全解除</span>
        </label>
        <span style={{ opacity: 0.6, fontSize: 12 }}>
          選択 {selected.size} / {posts.length}
        </span>
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <label
            key={p.id}
            className="flex gap-3 items-start border rounded p-3"
            style={{ background: "white" }}
          >
            <input
              type="checkbox"
              checked={selected.has(p.id)}
              onChange={() => toggle(p.id)}
            />
            <div className="flex-1">
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                pending ・ {p.facilityId}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{p.body}</div>
            </div>
          </label>
        ))}
        {posts.length === 0 && (
          <div style={{ opacity: 0.6 }}>承認待ちのリコログはありません。</div>
        )}
      </div>

      <div
        className="mt-4 p-3 border-t"
        style={{
          position: "sticky",
          bottom: 0,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          onClick={handleApprove}
          disabled={busy || selected.size === 0}
          className="px-4 py-2 rounded"
          style={{
            background: "#ec4899",
            color: "white",
            opacity: busy || selected.size === 0 ? 0.5 : 1,
          }}
        >
          公開（{selected.size}）
        </button>
      </div>
    </div>
  );
}