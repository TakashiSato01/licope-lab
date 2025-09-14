// apps/admin/src/pages/Dashboard.tsx
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileText, MessageSquare, Briefcase,
  BarChart3, Users, Settings, Bell, CircleHelp,
  ChevronsLeft, ChevronsRight, Menu as MenuIcon
} from "lucide-react";

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#3a3732]">
      {/* top bar */}
      <header className="sticky top-0 z-30 h-14 bg-[#f579a4] text-[#3a3732]/95">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-xl tracking-tight">Licope!</span>
            <div className="hidden sm:block text-white/95 text-sm">
              社会福祉法人 岩手盛岡園 <span className="opacity-80">|</span> 契約ID: FDENIS001
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-white/95 text-sm mr-2">リコベ 太郎</div>
            <div className="relative">
              <button aria-label="お知らせ" className="p-2 rounded-full hover:bg-white/15 text-white">
                <Bell size={18} />
              </button>
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-white text-[10px] text-[#f579a4] items-center justify-center font-semibold">•</span>
            </div>
            <button aria-label="ヘルプ" className="p-2 rounded-full hover:bg-white/15 text-white">
              <CircleHelp size={18} />
            </button>
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
                  <button className="w-full text-left px-3 py-2 hover:bg-black/5">ユーザー設定</button>
                  <button className="w-full text-left px-3 py-2 hover:bg黒/5">ログアウト</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: `${collapsed ? '72px' : '248px'} 1fr` }}>
        {/* sidebar */}
        <aside className={cn("min-h-[calc(100vh-56px)] bg-[#faf1f4] border-r border-black/5 transition-all",
          collapsed ? "px-2" : "px-4")}
        >
          <nav className="py-4 flex flex-col h-full">
            <div className="flex-1">
              <NavItem to="/" collapsed={collapsed} icon={LayoutDashboard} label="ダッシュボード" end />
              <NavItem to="/jobs" collapsed={collapsed} icon={FileText} label="求人ページ" />
              {/* ↓ 小文字に修正 */}
              <NavItem to="/licolog" collapsed={collapsed} icon={MessageSquare} label="リコログ" />
              <NavItem to="/works" collapsed={collapsed} icon={Briefcase} label="リコペワークス" />
              <NavItem to="/analytics" collapsed={collapsed} icon={BarChart3} label="詳細分析" />

              <div className="mt-4 space-y-2">
                {/* ↓ /jobs/new に遷移（見た目そのまま） */}
                <NavLink
                  to="/jobs/new"
                  className={cn(
                    "w-full inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium bg-[#f579a4] text-white hover:opacity-90",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <FileText size={16} /> {!collapsed && <span>求人ページを作成する</span>}
                </NavLink>

                {/* 遷移先は後で決める場合は # でもOK。用意済なら /jobs/applications 等に */}
                <NavLink
                  to="/applications"
                  className={cn(
                    "w-full inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-[#3a3732] hover:bg-black/5",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Users size={16} /> {!collapsed && <span>応募管理</span>}
                </NavLink>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <NavItem to="/settings" collapsed={collapsed} icon={Settings} label="設定" />
              <button
                onClick={() => setCollapsed((v) => !v)}
                className={cn("mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5", collapsed && "justify-center")}
                title="メニューを閉じる"
              >
                {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
                {!collapsed && <span className="text-sm">メニューを閉じる</span>}
              </button>
            </div>
          </nav>
        </aside>

        {/* main outlet */}
        <main className="min-h-[calc(100vh-56px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to, icon: Icon, label, collapsed, end = false,
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
          // 指示どおりアクティブ色は付けない（付けたくなったら isActive で装飾）
          ""
        )
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="text-sm">{label}</span>}
    </NavLink>
  );
}