import React from "react";
import PostList from "../components/PostList";
import Composer from "../components/Composer";

export default function Home() {
  return (
    <main className="pb-28">
      <PostList />
      <Composer />
    </main>
  );
}
