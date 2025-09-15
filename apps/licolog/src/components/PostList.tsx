import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import {
  LicologPost,
  subscribeMyPosts,
  subscribeOrgWall,
} from "/src/lib/repositories/licolog";

type Scope = "org" | "mine";

export default function PostList({ scope }: { scope: Scope }) {
  const [rows, setRows] = useState<LicologPost[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const unsub =
      scope === "org"
        ? subscribeOrgWall((ps) => {
            setRows(ps);
            setReady(true);
          })
        : subscribeMyPosts((ps) => {
            setRows(ps);
            setReady(true);
          });
    return () => unsub();
  }, [scope]);

  if (!ready) return <div className="text-white/70">読み込み中…</div>;
  if (rows.length === 0) return <div className="text-white/70">まだ投稿はありません。</div>;

  return (
    <div className="space-y-3">
      {rows.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}