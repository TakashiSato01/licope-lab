import React, { useEffect, useState } from "react";
import { LicologPost, pathToURL } from "/src/lib/repositories/licolog";

export default function PostCard({ post }: { post: LicologPost }) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const firstPath = post.media?.[0]?.path;
      const url = await pathToURL(firstPath);
      if (alive) setThumb(url);
    })();
    return () => {
      alive = false;
    };
  }, [post.id, post.media?.[0]?.path]);

  const created: Date | null =
    (post as any)?.createdAt?.toDate?.() ?? null;

  return (
    <div className="rounded-2xl bg-white/5 text-white p-4">
      <div className="text-xs opacity-70 mb-1">
        {post.status} ・ {post.facilityId}
        {created && <> ・ {created.toLocaleString()}</>}
      </div>
      <div className="whitespace-pre-wrap mb-3">{post.body}</div>
      {thumb && (
        <img
          src={thumb}
          alt=""
          className="rounded-xl max-h-56 w-auto object-cover"
        />
      )}
    </div>
  );
}