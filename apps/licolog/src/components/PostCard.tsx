// apps/licolog/src/components/PostCard.tsx
import { useEffect, useState } from "react";
import type { LicologPost } from "../lib/types/licolog";
import { auth, db } from "../lib/firebase";
import { pathToURL } from "../lib/repositories/licolog";
import { doc, onSnapshot } from "firebase/firestore";

export default function PostCard({
  post, onEdit,
}: { post: LicologPost; onEdit?: (p: LicologPost) => void }) {
  const me = auth.currentUser;
  const isMine = me?.uid === post.authorUid;

  // まずは UID の先頭6文字でフォールバックしておく
  const [authorName, setAuthorName] = useState<string>(
    post.authorUid?.slice(0, 6) ?? "user"
  );

  // ── author の表示名を members/{uid} から取得（なければ UID 先頭）──
  useEffect(() => {
    const uid = post.authorUid;
    if (!uid) return;

    // 自分の投稿で、Auth に displayName があるなら最優先
    if (isMine && me?.displayName) {
      setAuthorName(me.displayName);
      return;
    }

    const dref = doc(db, `organizations/demo-org/members/${uid}`);
    const unsub = onSnapshot(
      dref,
      (snap) => {
        const d = (snap.data() as any) || {};
        // よくある名前フィールドのゆれに全部対応
        const name =
          d.displayName ||
          d.name ||
          [d.lastName, d.firstName].filter(Boolean).join(" ").trim();
        setAuthorName(name || uid.slice(0, 6));
      },
      () => setAuthorName(uid.slice(0, 6))
    );
    return () => unsub();
  }, [post.authorUid, isMine, me?.displayName]);

  // 時刻
  const time = (() => {
    try {
      const d =
        typeof post.createdAt?.toDate === "function"
          ? post.createdAt.toDate()
          : new Date(post.createdAt);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  })();

  return (
    <article className="rounded-xl border border-black/5 bg-white p-3">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 grid place-items-center text-xs">
          👤
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{authorName}</div>
            <div className="text-xs text-gray-500">{time}</div>
          </div>

          <p className="mt-1 text-sm whitespace-pre-wrap break-words">
            {post.body}
          </p>

          {!!post.media?.length && (
            <div className="img-grid mt-2">
              {post.media.slice(0, 6).map((m) => (
                <AsyncImg key={m.path} path={m.path} />
              ))}
            </div>
          )}
        </div>

        {isMine && (
          <button
            onClick={() => onEdit?.(post)}
            title="編集"
            className="ml-1 text-gray-500 hover:text-gray-700"
          >
            ✎
          </button>
        )}
      </div>
    </article>
  );
}

function AsyncImg({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await pathToURL(path);
      if (alive) setUrl(u);
    })();
    return () => {
      alive = false;
    };
  }, [path]);
  if (!url) return <div className="w-full aspect-square bg-gray-100 rounded-lg" />;
  return <img src={url} alt="" className="w-full rounded-lg" />;
}