import React, { useState } from "react";

export default function Composer() {
  const [text, setText] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: repositories/licolog.addPost(...) に接続
    if (!text.trim()) return;
    setText("");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="fixed inset-x-0 bottom-0 bg-neutral-900 border-t border-neutral-800 p-3"
    >
      <div className="max-w-xl mx-auto flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="いまの様子を投稿..."
          className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 outline-none"
        />
        <button className="rounded-lg px-4 py-2 bg-blue-600 font-medium">
          投稿
        </button>
      </div>
    </form>
  );
}
