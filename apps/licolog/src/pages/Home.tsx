import React, { useState } from "react";
import Composer from "/src/components/Composer";
import PostList from "/src/components/PostList";

export default function Home() {
  const [tab, setTab] = useState<"org" | "mine">("org");

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-5xl font-black mb-6">Licope Licolog</h1>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setTab("org")}
          className={btn(tab === "org")}
        >
          法人全体
        </button>
        <button
          onClick={() => setTab("mine")}
          className={btn(tab === "mine")}
        >
          自分の投稿
        </button>
      </div>

      <Composer />

      <div className="mt-6">
        <PostList scope={tab} />
      </div>
    </div>
  );
}

function btn(active: boolean) {
  return `px-4 py-2 rounded-xl ${
    active ? "bg-white text-black" : "bg-white/10"
  }`;
}