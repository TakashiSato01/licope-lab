import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import JobsPage from "./pages/JobsPage";
import RicologPage from "./pages/RicologPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />, // 共通レイアウト
    children: [
      { index: true, element: <DashboardHome /> }, // "/" に来たらKPI+一覧
      { path: "jobs", element: <JobsPage /> },
      { path: "ricolog", element: <RicologPage /> },
      // { path: "works", element: <WorksPage /> },
      // { path: "analytics", element: <AnalyticsPage /> },
      // { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);