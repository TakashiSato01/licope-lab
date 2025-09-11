import React from "react";
import AppLayout from "./AppLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";

export const routes = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> }, // ウォール+コンポーザー
      { path: "login", element: <Login /> },
    ],
  },
];
