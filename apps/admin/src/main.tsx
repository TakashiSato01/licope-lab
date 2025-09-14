// apps/admin/src/main.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { ensureSignedIn } from "./lib/firebase";

// 画面
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import JobsPage from "./pages/JobsPage";
import JobCreatePage from "./pages/jobs/JobCreatePage";
import LicologPage from "./pages/LicologPage";
import PublicJobPage from "./pages/jobs/PublicJobPage";

function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureSignedIn().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div style={{ padding: 24 }}>
        Connecting to Auth/Firestore emulator…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 管理画面レイアウト配下 */}
        <Route element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/new" element={<JobCreatePage />} />
          <Route path="licolog" element={<LicologPage />} />
        </Route>

        {/* 公開ページ（ダッシュボード外） */}
        <Route path="/p/:orgId/jobs/:pubId" element={<PublicJobPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);