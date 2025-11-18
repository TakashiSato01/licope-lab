// apps/licolog/src/pages/Home.tsx
import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, ensureSignedIn, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import PostList from "../components/PostList";
import Composer from "../components/Composer";
import type { LicologPost } from "../lib/types/licolog";

const ORG_ID = "demo-org";
const DASHBOARD_URL = "http://localhost:5173";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  const [mode, setMode] = useState<"public" | "mine">("public");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LicologPost | undefined>();
  const [menu, setMenu] = useState(false);

  const [orgName, setOrgName] = useState("法人名を取得中…");
  const [facilityName, setFacilityName] = useState("施設名を取得中…");
  const [userLabel, setUserLabel] = useState("ユーザーを取得中…");

  const nav = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await ensureSignedIn();          // ここでは「状態確定」だけ
        const user = auth.currentUser;
        if (!user) {
          if (alive) {
            setNeedLogin(true);
          }
          return;
        }

        // ---- 法人名 ----
        let orgLocal = "（不明な法人）";
        try {
          const orgSnap = await getDoc(doc(db, "organizations", ORG_ID));
          const d = orgSnap.data() as any | undefined;
          if (d?.name) orgLocal = String(d.name);
        } catch (e) {
          console.error("[licolog/Home] org load error:", e);
          orgLocal = "（法人情報の取得エラー）";
        }

        // ---- メンバー情報 & 施設 ----
        let labelLocal = user.displayName || user.email || "";
        let facilityNameLocal = "（不明な施設）";

        try {
          const mref = doc(db, "organizations", ORG_ID, "members", user.uid);
          const msnap = await getDoc(mref);

          if (msnap.exists()) {
            const m = msnap.data() as any;
            const dn = m.displayName as string | undefined;
            const fn = m.firstName as string | undefined;
            const ln = m.lastName as string | undefined;
            const composed = [ln, fn].filter(Boolean).join(" ");
            labelLocal = dn || composed || labelLocal;

            const facilityId = (m.facilityId as string | undefined) || "";

            if (facilityId) {
              const col = collection(db, "organizations", ORG_ID, "facilities");
              const q = query(
                col,
                where("contractId", "==", facilityId),
                limit(1)
              );
              const snap = await getDocs(q);
              const fd = snap.docs[0]?.data() as any | undefined;
              if (fd?.name) facilityNameLocal = String(fd.name);
            }
          }
        } catch (e) {
          console.error("[licolog/Home] member/facility load error:", e);
        }

        if (!labelLocal) {
          labelLocal = user.isAnonymous ? "ゲスト職員" : "ユーザー";
        }

        if (alive) {
          setOrgName(orgLocal);
          setFacilityName(facilityNameLocal);
          setUserLabel(labelLocal);
        }
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (needLogin) {
    // licolog 単体で開いたときはログイン画面へ
    return <Navigate to="/login" replace />;
  }

  if (!ready) {
    return <div className="p-6 text-sm text-gray-500">読み込み中…</div>;
  }

  const user = auth.currentUser;
  const isAdmin = !!user && !user.isAnonymous;

  const handleLogout = async () => {
    await signOut(auth);
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

     <AppHeader
       orgName={orgName}
       facilityName={facilityName}
       userLabel={userLabel}
     />

      {/* ===== 本文エリア ===== */}
      <main className="flex-1 px-3">
        <div
          className="max-w-4xl mx-auto w-full flex flex-col pb-24"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          <PostList
            mode={mode}
            onEdit={(p) => {
              setEditing(p);
              setOpen(true);
            }}
          />

          {/* フッター */}
          <footer className="mt-auto pt-3 border-t text-[11px] text-gray-500 flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium text-gray-600">困ったときは</span>
            <div className="flex flex-wrap gap-3">
              <Link to="/how-to" className="text-sm text-gray-700 hover:underline">
  使い方ガイドを見る
</Link>
              <a
                href="https://glocalization.jp/form/contact/"
                className="underline underline-offset-2 hover:text-gray-800"
              >
                お問い合わせ
              </a>
            </div>
          </footer>
        </div>
      </main>

      {/* 右下の投稿ボタン */}
      <button
        onClick={() => {
          setEditing(undefined);
          setOpen(true);
        }}
        className="fixed right-4 bottom-20 grid place-items-center w-12 h-12 rounded-full text-white shadow-lg"
        style={{ background: "var(--brand)" }}
        aria-label="新規投稿"
      >
        💬
      </button>

      {/* 底タブ */}
      <nav className="fixed left-0 right-0 bottom-0 h-14 bg-white border-t flex">
        <Tab active={mode === "public"} onClick={() => setMode("public")}>
          公開されたリコログ
        </Tab>
        <Tab active={mode === "mine"} onClick={() => setMode("mine")}>
          自分のリコログ
        </Tab>
      </nav>

      <Composer open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 ${
        active ? "text-[var(--brand-ink)]" : "text-gray-500"
      }`}
    >
      <div
        className={`h-full grid place-items-center ${
          active ? "font-semibold" : ""
        }`}
      >
        {children}
      </div>
      {active && <div className="h-1 bg-[var(--brand)]" />}
    </button>
  );
}