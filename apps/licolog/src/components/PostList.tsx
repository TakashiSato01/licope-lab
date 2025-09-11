// apps/licolog/src/components/PostList.tsx
import React, { useEffect, useState } from "react";
import { subscribeLicologPosts } from "../lib/repositories/licolog";
import type { LicologPost } from "../lib/types"; // ★型は types.ts から

export default function PostList() {
  const [items, setItems] = useState<LicologPost[]>([]);

  useEffect(() => {
    const unsub = subscribeLicologPosts(setItems);
    return () => unsub();
  }, []);

  return (
    <div className="space-y-4 pb-28">
      {items.map((p) => (
        <div key={p.id} className="border border-neutral-700 rounded-xl p-4">
          <div className="text-xs text-neutral-400">
            {p.status}・{p.facilityId}
          </div>
          <div className="mt-2">{p.body}</div>
        </div>
      ))}
    </div>
  );
}