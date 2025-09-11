// apps/licolog/src/pages/Home.tsx
import React from "react";
import Composer from "../components/Composer";
import PostList from "../components/PostList";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white px-5 md:px-8 py-8">
      <h1 className="text-4xl font-extrabold mb-6">Licope Licolog</h1>
      <Composer />
      <PostList />
    </main>
  );
}