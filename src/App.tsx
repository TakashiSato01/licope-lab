// src/App.tsx
import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="app-container">
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #444', paddingBottom: '1rem' }}>
        <h1>Licope-Lab v2</h1>
        <nav>
          <Link to="/">Jobs</Link> | {/* 他のページができたらリンクを追加 */}
          {/* <Link to="/lp-builder">LP Builder</Link> */}
        </nav>
      </header>
      <main>
        {/* ここに、住所録で指定された各ページが表示される */}
        <Outlet />
      </main>
    </div>
  );
}