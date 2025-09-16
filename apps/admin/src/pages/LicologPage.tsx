// apps/admin/src/pages/LicologPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AdminLicologPost,
  LicologApprovalEvent,
  bulkApproveLicologPosts,
  subscribeLicologApprovalEvents,
  subscribePendingLicologPosts,
} from "@/lib/repositories/licolog";

function formatDate(ts?: any) {
  try {
    const d =
      typeof ts?.toDate === "function" ? ts.toDate() : new Date(ts ?? Date.now());
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

type LicologStatus = "pending" | "approved" | "hidden" | "internal";

const STATUS_MAP: Record<LicologStatus, { label: string; chip: string }> = {
  pending:  { label: "非公開",   chip: "bg-gray-100 text-gray-700" },
  approved: { label: "公開済み", chip: "bg-emerald-100 text-emerald-700" },
  hidden:   { label: "非表示",   chip: "bg-slate-200 text-slate-700" },
  internal: { label: "社内限定", chip: "bg-amber-100 text-amber-700" },
};

function StatusChip({ status }: { status: LicologStatus }) {
  const m = STATUS_MAP[status] ?? { label: String(status), chip: "bg-black/10" };
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${m.chip}`}>
      {m.label}
    </span>
  );
}

export default function LicologPage() {
  // 承認待ち
  const [pending, setPending] = useState<AdminLicologPost[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // 承認履歴
  const [history, setHistory] = useState<LicologApprovalEvent[]>([]);

  // 初期購読
  useEffect(() => {
    const unsub1 = subscribePendingLicologPosts(setPending);
    const unsub2 = subscribeLicologApprovalEvents(setHistory, { limit: 50 });
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, []);

  // チェック総数
  const selectedIds = useMemo(
    () => Object.entries(checked).filter(([, v]) => v).map(([id]) => id),
    [checked]
  );

  const allChecked = useMemo(() => {
    if (pending.length === 0) return false;
    return pending.every((p) => checked[p.id]);
  }, [pending, checked]);

  const toggleAll = (v: boolean) => {
    const m: Record<string, boolean> = {};
    pending.forEach((p) => (m[p.id] = v));
    setChecked(m);
  };

  async function onApproveSelected() {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(
      `チェックした ${selectedIds.length} 件を公開（approved）にします。よろしいですか？`
    );
    if (!ok) return;

    try {
      await bulkApproveLicologPosts(selectedIds);
      // 承認待ちから外れるので選択クリア
      setChecked({});
    } catch (e) {
      console.error(e);
      alert("公開に失敗しました");
    }
  }

  return (
    <div className="p-6 space-y-10">
      {/* 承認待ち */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">リコログ承認</h2>
          <div className="text-sm text-gray-500">承認待ち: {pending.length} 件</div>
        </div>

        {/* 全選択 */}
        <label className="flex items-center gap-2 mb-3 select-none">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <span>全選択 / 全解除</span>
          <span className="text-gray-500">（選択 {selectedIds.length} / {pending.length}）</span>
        </label>

        {/* リスト */}
<div className="space-y-3">
  {pending.length === 0 && (
    <div className="text-gray-500">承認待ちのリコログはありません。</div>
  )}

  {pending.map((p) => (
    <label
      key={p.id}
      className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 bg-white"
    >
      <input
        type="checkbox"
        className="mt-1"
        checked={!!checked[p.id]}
        onChange={(e) =>
          setChecked((prev) => ({ ...prev, [p.id]: e.target.checked }))
        }
      />

      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <StatusChip status={p.status as LicologStatus} />
          <span>{p.facilityId ?? "-"}</span>
          <span>・{formatDate(p.createdAt)}</span>
        </div>
        <div className="whitespace-pre-wrap">{p.body}</div>
      </div>
    </label>
  ))}
</div>

        {/* 公開ボタン */}
        <div className="mt-5">
          <button
            disabled={selectedIds.length === 0}
            onClick={onApproveSelected}
            className={`px-5 py-2 rounded-md font-semibold ${
              selectedIds.length === 0
                ? "bg-pink-200 text-white cursor-not-allowed"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            公開（{selectedIds.length}）
          </button>
        </div>
      </section>

      {/* 承認履歴 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">承認履歴</h2>
        {history.length === 0 ? (
          <div className="text-gray-500">まだ承認履歴はありません。</div>
        ) : (
          <ul className="space-y-3">
            {history.map((ev) => (
              <li
                key={ev.id}
                className="rounded-lg border border-gray-200 p-3 bg-white"
              >
                <div className="text-sm">
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700 mr-2">
                    承認
                  </span>
                  postId: <code className="text-xs">{ev.postId}</code>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  承認者: <code>{ev.approvedBy}</code> ／ {formatDate(ev.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}