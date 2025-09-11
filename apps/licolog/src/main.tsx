// apps/licolog/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // ← ここがポイント
import { ensureSignedIn } from "./lib/firebase";
import Home from "./pages/Home";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// 匿名サインインが完了してから描画（ルールで request.auth != null を満たす）
ensureSignedIn()
  .catch((e) => {
    console.error("Auth init failed", e);
  })
  .finally(() => {
    root.render(
      <React.StrictMode>
        <Home />
      </React.StrictMode>
    );
  });