// apps/admin/src/main.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { ensureSignedIn } from "./lib/firebase";

// 管理レイアウト配下
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import JobsPage from "./pages/JobsPage";
import JobCreatePage from "./pages/jobs/JobCreatePage";
import LicologPage from "./pages/LicologPage";
import ApplicationsPage from "./pages/ApplicationsPage";

// 公開ページ（管理レイアウトの外）
import PublicJobPage from "./pages/public/PublicJobPage";
import ApplyPage from "./pages/public/ApplyPage";

function App() {
  const [ready, setReady] = useState(false);

  // Auth(匿名)の確立を待ってから Router を作る
  useEffect(() => {
    ensureSignedIn().finally(() => setReady(true));
  }, []);

  if (!ready) {
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
          <Route path="applications" element={<ApplicationsPage />} />
        </Route>

        {/* 公開ページ（レイアウト外） */}
        <Route path="/p/:orgId/jobs/:pubId" element={<PublicJobPage />} />
        <Route path="/p/:orgId/jobs/:pubId/apply" element={<ApplyPage />} />

        {/* 不明ルートはトップへ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);