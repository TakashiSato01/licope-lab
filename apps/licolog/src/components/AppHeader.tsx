// apps/licolog/src/components/AppHeader.tsx
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";

export default function AppHeader({
  orgName,
  facilityName,
  userLabel,
}: {
  orgName: string;
  facilityName: string;
  userLabel: string;
}) {
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-[var(--brand)] text-white">
      <div className="h-14 max-w-4xl mx-auto w-full px-3 flex items-center justify-between gap-3">

        {/* 左側 */}
        <div className="flex items-center gap-4 min-w-0">
          {/* ロゴ */}
          <Link to="/" className="text-left">
            <span className="font-semibold text-sm leading-none block">Licope</span>
          </Link>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] opacity-80">ログイン中の施設</span>
            <span className="text-xs font-medium truncate">
              {orgName} / {facilityName}
            </span>
          </div>
        </div>

        {/* 右側 */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-[11px] opacity-80">ユーザー</span>
            <span className="text-xs font-medium truncate max-w-[160px]">
              {userLabel}
            </span>
          </div>

          {/* メニュー */}
          <div className="relative">
            <button
              className="w-9 h-9 rounded-full bg-white/90 text-[var(--brand-ink)] text-sm shadow-sm"
              onClick={() => setMenu(v => !v)}
            >
              ≡
            </button>

            {menu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow border p-1 text-sm z-50">

                <Link
                  to="/how-to"
                  className="block px-3 py-2 rounded-lg text-rose-600 hover:bg-black/5"
                  onClick={() => setMenu(false)}
                >
                  使い方ガイド
                </Link>

                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-lg text-rose-600 hover:bg-black/5"
                  onClick={() => setMenu(false)}
                >
                  ユーザー設定
                </Link>

                <button
                  onClick={async () => {
                    await signOut(auth);
                    nav("/login");
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 text-rose-600"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}