// apps/licolog/src/components/PostList.tsx
import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "/src/lib/firebase";
import {
  subscribeOrgWall,
  subscribeMyPosts,
} from "/src/lib/repositories/licolog";
import type { LicologPost } from "/src/lib/repositories/licolog"; // re-exportでOK

type Props = { scope: "org" | "mine" };

export default function PostList({ scope }: Props) {
  const [posts, setPosts] = useState<LicologPost[]>([]);
  const [mineUid, setMineUid] = useState<string | null>(
    auth.currentUser?.uid ?? null
  );

  useEffect(() => {
    // 自分判定用にUIDを追従
    const stopAuth = onAuthStateChanged(auth, (u) =>
      setMineUid(u?.uid ?? null)
    );

    // タブ切替ごとに購読を貼り直す
    const stop =
      scope === "org"
        ? subscribeOrgWall(setPosts)
        : subscribeMyPosts(setPosts);

    return () => {
      stop?.();
      stopAuth();
    };
  }, [scope]);

  // （必要なら法人タブはapprovedだけに絞る）
  const visible =
    scope === "org" ? posts.filter((p) => p.status === "approved") : posts;

  if (!visible.length) {
    return <div className="text-white/60">まだ投稿はありません。</div>;
  }

  return (
    <div className="space-y-3">
      {visible.map((p) => (
        <PostCard key={p.id} post={p} mine={!!mineUid && p.authorUid === mineUid} />
      ))}
    </div>
  );
}