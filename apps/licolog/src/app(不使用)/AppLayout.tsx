import React from "react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      {/* ヘッダーを付けたくなったらここに */}
      <Outlet />
    </div>
  );
}
