import React from "react";
import PostCard from "./PostCard";

const dummy = [
  { id: "1", body: "こんにちは！", createdAt: new Date().toLocaleString() },
];

export default function PostList() {
  return (
    <section className="max-w-xl mx-auto p-4 space-y-3">
      {dummy.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </section>
  );
}
