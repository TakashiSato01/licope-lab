// apps/licolog/src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav("/", { replace: true });
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message ?? "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-[min(420px,92vw)] bg-white rounded-2xl shadow border border-black/5 p-6">
        <h1 className="text-2xl font-bold">リコログにログイン</h1>
        <p className="mt-2 text-sm text-gray-500">
          Licopeで利用しているメールアドレスとパスワードを入力してください。
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-lg border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              パスワード
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg border"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </div>

          {msg && (
            <div className="text-xs text-red-500 whitespace-pre-line">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 px-4 py-2 rounded-md text-white ${
              loading ? "bg-pink-300" : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            {loading ? "ログイン中…" : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}