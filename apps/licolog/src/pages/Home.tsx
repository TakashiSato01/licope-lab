// apps/licolog/src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, ensureSignedIn } from "../lib/firebase";
import PostList from "../components/PostList";
import Composer from "../components/Composer";
import type { LicologPost } from "../lib/types/licolog";

export default function Home() {
  // ① まずは匿名サインインが完了するまで待つ
  const [ready, setReady] = useState(false);

  // ② 画面状態
  const [mode, setMode] = useState<"public" | "mine">("public");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LicologPost | undefined>();
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await ensureSignedIn();
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) {
    return <div className="p-6 text-sm text-gray-500">読み込み中…</div>;
  }

  return (
    <div className="grid grid-rows-[auto,1fr]">
      {/* AppBar */}
      <header
        className="h-12 px-3 flex items-center justify-between sticky top-0 z-40"
        style={{ background: "var(--brand)" }}
      >
        <div className="flex items-center gap-2">
          <img src="/brand/logo.svg" alt="licolog" className="h-6" />
        </div>
        <div className="relative">
          <button
            className="w-9 h-9 rounded-full bg-white/20 text-white"
            onClick={() => setMenu((v) => !v)}
            aria-label="メニュー"
          >
            ≡
          </button>
          {menu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow border p-1 text-sm">
              <Link
                to="/settings"
                className="block px-3 py-2 rounded-lg hover:bg-black/5"
              >
                ユーザー設定
              </Link>
              <button
                onClick={async () => {
                  await signOut(auth);
                  nav("/login");
                }}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-black/5"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Feed */}
      <main className="p-3">
        <PostList
          mode={mode}
          onEdit={(p) => {
            setEditing(p);
            setOpen(true);
          }}
        />
      </main>

      {/* 右下の投稿ボタン（追従） */}
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
        <Tab
          active={mode === "public"}
          onClick={() => setMode("public")}
        >
          公開されたリコログ
        </Tab>
        <Tab
          active={mode === "mine"}
          onClick={() => setMode("mine")}
        >
          自分のリコログ
        </Tab>
      </nav>

      {/* 投稿フォーム（新規/編集） */}
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
      className={`flex-1 ${active ? "text-[var(--brand-ink)]" : "text-gray-500"}`}
    >
      <div
        className={`h-full grid place-items-center ${active ? "font-semibold" : ""}`}
      >
        {children}
      </div>
      {active && <div className="h-1 bg-[var(--brand)]" />}
    </button>
  );
}