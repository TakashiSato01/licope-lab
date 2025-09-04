// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.tsx';
import JobsPage from './pages/JobsPage.tsx'; // 作成したページをimport
import './index.css';

// 住所録を作成
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />, // 全てのページの"親"となる枠組み
        children: [
            {
                index: true, // "/"（トップページ）に来たら、これを表示
                element: <JobsPage />,
            },
            // 将来、ここに新しいページを追加していく
            // { path: "lp-builder", element: <LpBuilderPage /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);