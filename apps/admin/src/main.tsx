import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { auth, waitAuthReady } from "./lib/firebase";
import { useOrgRole } from "./hooks/useOrgRole";

// 管理レイアウト配下
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import JobsPage from "./pages/JobsPage";
import JobCreatePage from "./pages/jobs/JobCreatePage";
import LicologPage from "./pages/LicologPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import TokushoPage from "./pages/TokushoPage";
import PolicyPage from "./pages/PolicyPage";
import FaqPage from "./pages/FaqPage";
import NewsPage from "./pages/NewsPage";


// 公開配下（認証不要）
import PublicJobPage from "./pages/public/PublicJobPage";
import ApplyPage from "./pages/public/ApplyPage";

// ログイン画面
import Login from "./pages/Login";

// --- 認証ゲート：未ログインなら <Login /> を表示 ---
function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    waitAuthReady().then((u) => {
      setUid(u?.uid ?? null);
      setReady(true);
    });
    const unsub = auth.onAuthStateChanged((u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  if (!ready) return <div style={{ padding: 24 }}>Connecting Auth…</div>;
  if (!uid) return <Login />;
  return <RoleGate uid={uid}>{children}</RoleGate>;
}

// --- ロールゲート：組織ロール未付与ならブロック ---
function RoleGate({ uid, children }: { uid: string; children: React.ReactNode }) {
  const { role, loading } = useOrgRole(uid);

  if (loading) return <div style={{ padding: 24 }}>Checking role…</div>;
  if (!role) {
    return (
      <div className="p-8">
        アクセス権がありません。管理者に問い合わせて、あなたのユーザーにロールを付与してください。
      </div>
    );
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 管理レイアウト配下（Outletで表示） */}
        <Route element={<AuthGate><Dashboard /></AuthGate>}>
          <Route index element={<DashboardHome />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/new" element={<JobCreatePage />} />
          <Route path="licolog" element={<LicologPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="legal/tokusho" element={<TokushoPage />} />
          <Route path="legal/policy" element={<PolicyPage />} />
        </Route>

        {/* 公開ページ（認証不要） */}
        <Route path="/p/:orgId/jobs/:jobId" element={<PublicJobPage />} />
        <Route path="/p/:orgId/jobs/:jobId/apply" element={<ApplyPage />} />

        {/* 不明ルートはトップへ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);