// apps/licolog/src/PostList.tsx
import { useEffect, useState } from "react";
import type { LicologPost } from "./lib/types/licolog";
import { subscribeOrgWall, subscribeMyPosts } from "../lib/repositories/licolog";
import PostCard from "./PostCard";

export default function PostList({ mode, onEdit }: {
  mode: "public" | "mine"; onEdit: (p: LicologPost) => void;
}) {
  const [posts, setPosts] = useState<LicologPost[]>([]);
  useEffect(() => {
    return mode === "public" ? subscribeOrgWall(setPosts) : subscribeMyPosts(setPosts);
  }, [mode]);

  if (!posts.length) return (
    <div className="text-center text-sm text-gray-500 py-8">まだ投稿はありません</div>
  );

  return (
    <div className="space-y-3 pb-24">
      {posts.map((p) => <PostCard key={p.id} post={p} onEdit={onEdit} />)}
    </div>
  );
}