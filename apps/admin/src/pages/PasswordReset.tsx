import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";

/**
 * /password-reset
 * - クエリ無し: メール入力 → 変更URL送信
 * - ?mode=resetPassword&oobCode=...: 新PW設定フォーム
 */
export default function PasswordReset() {
  const [sp] = useSearchParams();
  const mode = sp.get("mode");
  const oobCode = sp.get("oobCode");
  const resetPhase = useMemo(() => mode === "resetPassword" && !!oobCode, [mode, oobCode]);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="h-14 bg-[#f579a4] text-white flex items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/brand/logo.svg" alt="Licope" className="h-6" />
        </Link>
        <div className="ml-3 font-medium">
          {resetPhase ? "パスワード再設定" : "パスワードリセット"}
        </div>
      </header>

      <main className="max-w-md mx-auto p-6">
        {resetPhase ? <ResetWithCode oobCode={oobCode!} /> : <RequestReset />}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:underline">
            ログインに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}

function RequestReset() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSending(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/password-reset",
        handleCodeInApp: true,
      });
      setMsg("パスワード変更用のURLをメールで送信しました。メールをご確認ください。");
    } catch (e: any) {
      setMsg(e?.message ?? "送信に失敗しました。メールアドレスをご確認ください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-black/5 p-5">
      <h1 className="text-lg font-semibold mb-4">パスワードを忘れた方</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <div className="text-xs text-gray-500 mb-1">メールアドレス</div>
          <input
            type="email"
            required
            className="w-full px-3 py-2 rounded-lg border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={sending}
          className={`px-4 py-2 rounded-md text-white ${
            sending ? "bg-pink-300" : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          {sending ? "送信中…" : "変更用URLを送信"}
        </button>
      </form>
      {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}
      <p className="mt-2 text-xs text-gray-500">
        メールのリンクから遷移後、このページで新しいパスワードを設定できます。
      </p>
    </section>
  );
}

function ResetWithCode({ oobCode }: { oobCode: string }) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        if (alive) setValid(true);
      } catch {
        if (alive) setValid(false);
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, [oobCode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!newPw || newPw.length < 8) {
      setMsg("パスワードは8文字以上にしてください。");
      return;
    }
    if (newPw !== newPw2) {
      setMsg("新しいパスワードが一致しません。");
      return;
    }
    setSaving(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPw);
      setMsg("パスワードを更新しました。ログイン画面からサインインしてください。");
    } catch (e: any) {
      setMsg(e?.message ?? "パスワードの更新に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <section className="bg-white rounded-xl border border-black/5 p-5">
        <div className="text-sm text-gray-600">リンクを確認しています…</div>
      </section>
    );
  }
  if (!valid) {
    return (
      <section className="bg-white rounded-xl border border-black/5 p-5">
        <div className="text-sm text-red-600">
          リンクが無効または期限切れです。再度メール送信を行ってください。
        </div>
        <div className="mt-3">
          <Link
            to="/password-reset"
            className="inline-flex px-4 py-2 rounded-md text-white bg-pink-500 hover:bg-pink-600"
          >
            変更用URLを再送する
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-black/5 p-5">
      <h1 className="text-lg font-semibold mb-4">新しいパスワードを設定</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <div className="text-xs text-gray-500 mb-1">新しいパスワード</div>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg border"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="8文字以上"
          />
        </label>
        <label className="block">
          <div className="text-xs text-gray-500 mb-1">新しいパスワード（確認）</div>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg border"
            value={newPw2}
            onChange={(e) => setNewPw2(e.target.value)}
            placeholder="もう一度入力"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 rounded-md text-white ${
            saving ? "bg-pink-300" : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          {saving ? "保存中…" : "パスワードを更新"}
        </button>
      </form>
      {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}
    </section>
  );
}