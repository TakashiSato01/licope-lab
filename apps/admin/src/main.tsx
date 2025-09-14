// apps/admin/src/main.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Firebase エミュ接続 & 匿名ログイン完了まで待つ
import { ensureSignedIn } from "./lib/firebase";

// レイアウト & ページ
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";

// ★一覧ページ（既存の JobsPage.tsx をこの役にしてOK）
import JobsIndexPage from "./pages/JobsPage";

// ★新規作成ページ（このファイルを追加します）
import JobCreatePage from "./pages/jobs/JobCreatePage";

import LicologPage from "./pages/LicologPage";
import LpBuilderPage from "./pages/LpBuilderPage";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSignedIn().finally(() => setReady(true));
  }, []);

  if (!ready) {
    // Router を作らず、フック実行を避ける
    return <div style={{ padding: 24 }}>Connecting to Auth/Firestore emulator…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* サイドバー付きのレイアウト */}
        <Route element={<Dashboard />}>
          {/* ホーム */}
          <Route index element={<DashboardHome />} />

          {/* 求人：一覧 → /jobs、新規作成 → /jobs/new */}
          <Route path="jobs">
            <Route index element={<JobsIndexPage />} />
            <Route path="new" element={<JobCreatePage />} />
          </Route>

          {/* リコログ・LPビルダー */}
          <Route path="licolog" element={<LicologPage />} />
          <Route path="lp" element={<LpBuilderPage />} />
        </Route>

        {/* フォールバック */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);