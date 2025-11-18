import React, { useEffect, useMemo, useState } from "react";
import {
  AdminLicologPost,
  LicologEvent,
  bulkApproveLicologPosts,
  subscribePendingLicologPosts,
  subscribeLicologEvents,
  unapproveLicologPost,
} from "@/lib/repositories/licolog";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

const LICOLOG_APP_ORIGIN =
  (import.meta as any).env?.VITE_LICOLOG_APP_ORIGIN || "http://localhost:5174";

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

function SmallThumb({
  path,
  className,
}: {
  path?: string | null;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let dead = false;
    if (!path) {
      setUrl(null);
      return;
    }
    getDownloadURL(ref(storage, path))
      .then((u) => {
        if (!dead) setUrl(u);
      })
      .catch(() => {
        if (!dead) setUrl(null);
      });
    return () => {
      dead = true;
    };
  }, [path]);
  const root = className ?? "w-24 h-20 py-1 rounded-lg";
  return (
    <div className={`${root} overflow-hidden`}>
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-17 grid place-items-center bg-gray-100 text-[10px] text-gray-400">
          NO IMAGE
        </div>
      )}
    </div>
  );
}

export default function LicologPage() {
  // 公開待ち
  const [pending, setPending] = useState<AdminLicologPost[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // 履歴（公開・取消 共通のイベント）
  const [events, setEvents] = useState<LicologEvent[]>([]);
  const [postBodies, setPostBodies] = useState<Record<string, string>>({});

  // 監視開始
  useEffect(() => {
    const unsub1 = subscribePendingLicologPosts(setPending);
    const unsub2 = subscribeLicologEvents(setEvents, { limit: 50 });
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, []);

  // 履歴に載っている postId の本文を遅延取得してキャッシュ
  useEffect(() => {
    const missing = events.map((e) => e.postId).filter((id) => !postBodies[id]);
    if (!missing.length) return;

    (async () => {
      const entries: Record<string, string> = {};
      for (const id of missing) {
        try {
          const snap = await getDoc(
            doc(db, `organizations/demo-org/licologPosts/${id}`)
          );
          entries[id] = (snap.data()?.body as string | undefined) ?? "";
        } catch {
          /* noop */
        }
      }
      if (Object.keys(entries).length)
        setPostBodies((prev) => ({ ...prev, ...entries }));
    })();
  }, [events, postBodies]);

  // 選択制御
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

  // 公開
  async function onApproveSelected() {
    if (!selectedIds.length) return;
    if (
      !confirm(
        `チェックした ${selectedIds.length} 件を公開（approved）にします。よろしいですか？`
      )
    )
      return;

    try {
      await bulkApproveLicologPosts(selectedIds);
      setChecked({});
    } catch (e) {
      console.error(e);
      alert("公開に失敗しました");
    }
  }

  // 未公開へ戻す
  async function onUnapprove(id: string) {
    if (!confirm("この投稿を未公開（pending）に戻します。よろしいですか？")) return;
    try {
      await unapproveLicologPost(id);
      // 成功すれば監視で自動反映される
    } catch (e) {
      console.error(e);
      alert("未公開に戻せませんでした");
    }
  }

  return (
    <div className="p-6 space-y-10">
      {/* リコログアプリへの導線 */}
      <div className="flex items-center justify-end gap-2">
        <a
          href={`${LICOLOG_APP_ORIGIN}/`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 rounded-md border hover:bg-black/5 text-sm"
        >
          リコログ一覧を開く
        </a>
        <a
          href={`${LICOLOG_APP_ORIGIN}/`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 rounded-md text-white bg-pink-500 hover:bg-pink-600 text-sm"
        >
          新規投稿を開く
        </a>
      </div>

      {/* 公開待ち */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">リコログを求人ページに公開</h2>
          <div className="text-sm text-gray-500">
            公開待ち: {pending.length} 件
          </div>
        </div>

        <label className="flex items-center gap-2 mb-3 select-none">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <span>全選択 / 全解除</span>
          <span className="text-gray-500">
            （選択 {selectedIds.length} / {pending.length}）
          </span>
        </label>

        <div className="space-y-3">
          {pending.length === 0 && (
            <div className="text-gray-500">
              公開待ちのリコログはありません。
            </div>
          )}
          {pending.map((p) => (
            <label
              key={p.id}
              className="flex gap-3 items-start rounded-lg border border-gray-200 p-3 bg-white"
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
                <div className="text-xs text-gray-500 mb-1">
                  未公開 ・ {p.facilityId ?? "-"} ・ {formatDate(p.createdAt)}
                </div>
                <div className="flex gap-3">
                  <SmallThumb path={p.media?.[0]?.path ?? null} />
                  <div className="whitespace-pre-wrap flex-1 py-1">{p.body}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

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

      {/* 公開履歴（公開・取消） */}
      <section>
        <h2 className="text-xl font-semibold mb-4">公開履歴</h2>
        {events.length === 0 ? (
          <div className="text-gray-500">まだ履歴はありません。</div>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => {
              const title =
                (postBodies[ev.postId] || "").split(/\r?\n/)[0] ||
                "(本文取得中…)";
              const isApproved = ev.type === "licolog_approved";
              return (
                <li
                  key={ev.id}
                  className="rounded-lg border border-gray-200 p-3 bg-white"
                >
                  <div className="text-sm">
                    {isApproved ? (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700 mr-2">
                        公開
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-slate-200 text-slate-700 mr-2">
                        取消
                      </span>
                    )}
                    <span className="font-medium">{title}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    操作: <code>{ev.approvedBy}</code> ／ {formatDate(ev.createdAt)}
                  </div>

                  {/* 「未公開に戻す」は公開イベントの行にだけ表示 */}
                  {isApproved && (
                    <div className="mt-2">
                      <button
                        onClick={() => onUnapprove(ev.postId)}
                        className="px-3 py-1.5 rounded-md border hover:bg-black/5 text-sm"
                        title="未公開（pending）に戻す"
                      >
                        未公開に戻す
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}