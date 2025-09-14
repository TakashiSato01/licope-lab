// apps/admin/src/main.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { ensureSignedIn } from "./lib/firebase";

// 管理レイアウト配下のページ
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import JobsPage from "./pages/JobsPage";
import JobCreatePage from "./pages/jobs/JobCreatePage";
import LicologPage from "./pages/LicologPage";
import ApplicationsPage from "./pages/ApplicationsPage"; // ← 追加（応募管理）

// 公開ページ（管理レイアウトの外）
import PublicJobPage from "./pages/public/PublicJobPage";
import ApplyPage from "./pages/public/ApplyPage"; // ← 追加（応募フォーム）

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth/Firestore エミュ接続 + 匿名ログインが完了するまで待つ
    ensureSignedIn().finally(() => setReady(true));
  }, []);

  if (!ready) {
    // Router をまだ作らない（NavLink/useLocation が実行されないように）
    return <div style={{ padding: 24 }}>Connecting to Auth/Firestore emulator…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 管理レイアウト配下 */}
        <Route element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/new" element={<JobCreatePage />} />
          <Route path="licolog" element={<LicologPage />} />
          <Route path="applications" element={<ApplicationsPage />} /> {/* 応募管理 */}
        </Route>

        {/* 公開ページ（レイアウト外） */}
        <Route path="/p/:orgId/jobs/:pubId" element={<PublicJobPage />} />
        <Route path="/p/:orgId/jobs/:pubId/apply" element={<ApplyPage />} /> {/* 応募フォーム */}

        {/* 不明ルートはトップへ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);