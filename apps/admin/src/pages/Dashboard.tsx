// apps/admin/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Link, Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileText, MessageSquare, Briefcase,
  BarChart3, Users, Settings, Bell, CircleHelp,
  ChevronsLeft, ChevronsRight, Menu as MenuIcon
} from "lucide-react";

// Firebase
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";
import { db, doSignOut, auth } from "@/lib/firebase";  // ← db 必須

import { ORG_ID } from "@/lib/auth";
import { useOrgMeta, useMyMember, useFacilityMetaByContractId } from "@/lib/org";
import { useOrgRole } from "@/hooks/useOrgRole";

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

const DEFAULT_AVATAR = "/assets/avatar-default.png";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingWall, setLoadingWall] = useState(true);   // ← 追加：読み込み中フラグ
  const [posts, setPosts] = useState<any[]>([]);          // ← 追加：リコログ表示データ


  // サイド幅の反映
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--adm-sidebar-w",
      collapsed ? "72px" : "248px"
    );
  }, [collapsed]);

  // メタ情報
  const uid = auth.currentUser?.uid ?? null;
  const org = useOrgMeta(ORG_ID);
  const me  = useMyMember(ORG_ID, uid);
  const { role } = useOrgRole(uid || "");
  const facility = useFacilityMetaByContractId(ORG_ID, me?.facilityId);

 // ★ リコログ購読（管理者ダッシュボード用）
 useEffect(() => {
   // Firestore: organizations/{orgId}/licologPosts の approved を取得
   setLoadingWall(true);
   const col = collection(db, `organizations/${ORG_ID}/licologPosts`);
   const q = query(
     col,
     where("status", "==", "approved"),
     orderBy("createdAt", "desc"),
     limit(20)
   );

   const unsub = onSnapshot(
     q,
     (snap) => {
       const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
       setPosts(rows);
       setLoadingWall(false);           // ← ここで読み込み完了
     },
     (err) => {
       console.error("[Dashboard] licolog subscribe error:", err);
       setPosts([]);
       setLoadingWall(false);
     }
   );
   return () => unsub();
 }, []);

  // 表示名＆アイコン
  const displayName =
    (me?.lastName || me?.firstName)
      ? `${me?.lastName ?? ""} ${me?.firstName ?? ""}`.trim()
      : (auth.currentUser?.displayName ?? "—");

  const avatarSrc =
    auth.currentUser?.photoURL ||
    (me as any)?.photoURL ||
    DEFAULT_AVATAR;

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#3a3732]">
      {/* Top bar */}
      <header className="adm-header z-30 h-14 bg-[#f579a4] text-[#3a3732]/95">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Licope ホーム" className="flex items-center">
              <img
                src="brand/logo.svg"
                alt="Licope"
                className="h-7 w-auto select-none"
                draggable={false}
              />
            </Link>
            <div className="hidden sm:block text-white/95 text-sm">
              {org?.name ?? "—"}
              <span className="opacity-80">|</span>{" "}
              {facility?.name ?? "—"}{/*  <span className="opacity-80">|</span>{" "}
              契約ID: {facility?.contractId ?? "—"} */}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-white/95 text-sm mr-2">
              <img
                src={avatarSrc}
                className="w-7 h-7 rounded-full object-cover border border-white/30 mr-2"
                onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                alt=""
              />
              <div className="hidden sm:block text-white/95 text-sm mr-2">
                {displayName}
              </div>
            </div>

            <div className="relative">
              <Link
                to="/news"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/5 text-white transition"
                title="お知らせ"
              >
                <Bell size={18} />
              </Link>
            </div>

            <Link
              to="/faq"
              className="p-2 rounded-full hover:bg-white/15 text-white"
              title="よくある質問"
            >
              <CircleHelp size={18} />
            </Link>

            <div className="relative">
              <button
                aria-label="ユーザーメニュー"
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-white/15 text-white flex items-center"
              >
                <MenuIcon size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-lg text-sm text-[#3a3732]">
                  <Link to="/settings" className="block px-3 py-2 hover:bg-black/5">ユーザー設定</Link>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-black/5"
                    onClick={() => doSignOut()}
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[#faf1f4] border-r border-black/5 transition-all adm-sidebar",
          collapsed ? "px-2" : "px-4"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="adm-sidebar__scroll py-4">
            <NavItem to="/"        collapsed={collapsed} icon={LayoutDashboard} label="ダッシュボード" end />
            <NavItem to="/jobs"    collapsed={collapsed} icon={FileText}       label="求人ページ一覧" />
            <NavItem to="/licolog" collapsed={collapsed} icon={MessageSquare}  label="投稿されたリコログ" />
            <NavItem to="/works"   collapsed={collapsed} icon={Briefcase}      label="リコペワークス(準備中)" />
            <NavItem to="/analysis"collapsed={collapsed} icon={BarChart3}      label="詳細分析(準備中)" />
            <NavItem to="/applications" collapsed={collapsed} icon={Users}     label="応募管理" />

            <div className="mt-4">
              <NavLink
                to="/jobs/new"
                className={cn(
                  "w-full inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium bg-[#f579a4] text-white hover:opacity-90",
                  collapsed && "justify-center px-2"
                )}
              >
                <FileText size={16} /> {!collapsed && <span>かんたん求人ページ作成</span>}
              </NavLink>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-black/5">
            {/* 管理者のみ：環境設定／職員管理 */}
            {(role === "owner" || role === "admin") && (
              <>
                <NavItem to="/admin/settings" collapsed={collapsed} icon={Settings} label="環境設定（管理）" />
                <NavItem to="/admin/members"  collapsed={collapsed} icon={Users}    label="職員管理" />
              </>
            )}

            <button
              onClick={() => setCollapsed((v) => !v)}
              className={cn(
                "mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5",
                collapsed && "justify-center"
              )}
              title="メニューを閉じる"
            >
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              {!collapsed && <span className="text-sm">メニューを閉じる</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main" style={{ minHeight: "calc(100vh - var(--adm-header-h))" }}>
   <Outlet />
      </main>
    </div>
  );
}

function NavItem({
  to, icon: Icon, label, collapsed, end = false
}:{
  to: string; icon: any; label: string; collapsed: boolean; end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors",
          collapsed && "justify-center",
          isActive && "bg-black/5"
        )
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="text-sm">{label}</span>}
    </NavLink>
  );
}