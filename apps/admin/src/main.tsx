// apps/admin/src/main.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Firebase（エミュ）初期化と匿名ログイン
import { ensureSignedIn } from "./lib/firebase";

// 画面
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import JobsPage from "./pages/JobsPage";
import LicologPage from "./pages/LicologPage";
import LpBuilderPage from "./pages/LpBuilderPage";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth エミュ + 匿名ログインが完了するまで待つ
    ensureSignedIn().finally(() => setReady(true));
  }, []);

  if (!ready) {
    // ここでは Router をまだ作らない（NavLink/useLocation を発火させない）
    return (
      <div style={{ padding: 24 }}>
        Connecting to Auth/Firestore emulator…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* サイドバーなどを含むレイアウト */}
        <Route element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="licolog" element={<LicologPage />} />
          <Route path="lp" element={<LpBuilderPage />} />
        </Route>

        {/* どのルートにも当たらなければホームへ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);