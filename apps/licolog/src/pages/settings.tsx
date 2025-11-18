// apps/licolog/src/pages/Settings.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db, storage, ensureSignedIn } from "../lib/firebase";
import { updateEmail, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ORG_ID = "demo-org";

type ReadonlyInfo = {
  orgName: string;
  facilityName: string;
  uid: string;
};

const DEFAULT_AVATAR = "src/assets/avatar-default.png";

export default function SettingsPage() {
  // Auth の復元を考慮して、user は state で持つ
  const [user, setUser] = useState(() => auth.currentUser);
  const [ready, setReady] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  const [ro, setRo] = useState<ReadonlyInfo>({
    orgName: "",
    facilityName: "",
    uid: user?.uid ?? "-",
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.photoURL || DEFAULT_AVATAR,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // 読み取り専用の表示値（法人名・施設名）＋プロフィール初期値
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // 匿名ログイン or 既存セッション復元を待つ
        await ensureSignedIn();
        const u = auth.currentUser;
        if (!u) {
          if (alive) setNeedLogin(true);
          return;
        }
        if (alive) {
          setUser(u);
          setEmail(u.email ?? "");
        }

        const orgId = ORG_ID;
        const memberId = u.uid;

        // organizations/{orgId}
        const orgSnap = await getDoc(doc(db, "organizations", orgId));
        const orgName =
          (orgSnap.data()?.name as string) ?? "（不明な法人）";

        // organizations/{orgId}/members/{uid}
        const memberSnap = await getDoc(
          doc(db, "organizations", orgId, "members", memberId),
        );

        // members から契約ID（facilityId）を取得し、facilities.contractId で name を引く
        const facilityId = (memberSnap.data()?.facilityId as string) ?? "";
        let facilityName = "（不明な施設）";
        if (facilityId) {
          const col = collection(db, "organizations", orgId, "facilities");
          const q = query(
            col,
            where("contractId", "==", facilityId),
            limit(1),
          );
          const snap = await getDocs(q);
          const d = snap.docs[0]?.data();
          if (d?.name) facilityName = String(d.name);
        }

        if (alive) {
          setRo({ orgName, facilityName, uid: u.uid });
        }

        // 名前は members.firstName/lastName → Auth.displayName から初期化
        const m = memberSnap.data() as any | undefined;
        const fn =
          (m?.firstName as string) ??
          (u.displayName ? u.displayName.split(" ")[1] ?? "" : "");
        const ln =
          (m?.lastName as string) ??
          (u.displayName ? u.displayName.split(" ")[0] ?? "" : "");

        if (alive) {
          setFirstName(fn);
          setLastName(ln);
        }

        // アイコンは Auth > members.photoURL > デフォルト
        const url = u.photoURL || m?.photoURL || DEFAULT_AVATAR;
        if (alive) setAvatarUrl(url);
      } catch {
        if (alive) {
          setRo((p) => ({
            ...p,
            orgName: "（取得エラー）",
            facilityName: "（取得エラー）",
          }));
        }
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function onSaveProfile() {
    setMsg(null);
    setSaving(true);
    try {
      if (!user) {
        throw new Error(
          "ユーザー情報が取得できていません。ページを再読み込みしてください。",
        );
      }

      const displayName = [lastName, firstName].filter(Boolean).join(" ");

      await updateProfile(user, { displayName });
      await setDoc(
        doc(db, "organizations", ORG_ID, "members", user.uid),
        { firstName, lastName, displayName },
        { merge: true },
      );

      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      setMsg("プロフィールを保存しました。");
    } catch (e: any) {
      setMsg(e?.message ?? "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    // 即時プレビュー
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  }

  async function onSaveAvatar() {
    if (!avatarFile) {
      setMsg("画像が選択されていません。");
      return;
    }
    setUploading(true);
    setMsg(null);

    try {
      if (!user) {
        throw new Error(
          "ユーザー情報が取得できていません。ページを再読み込みしてください。",
        );
      }

      const path = `organizations/${ORG_ID}/members/${user.uid}/avatar_${Date.now()}.jpg`;
      const sref = ref(storage, path);
      await uploadBytes(sref, avatarFile, { contentType: avatarFile.type });
      const url = await getDownloadURL(sref);

      await updateProfile(user, { photoURL: url });
      await setDoc(
        doc(db, "organizations", ORG_ID, "members", user.uid),
        { photoURL: url },
        { merge: true },
      );

      setAvatarUrl(url);
      setAvatarFile(null);
      setMsg("アイコンを更新しました。");
    } catch (e: any) {
      setMsg(e?.message ?? "アイコンの保存に失敗しました。");
    } finally {
      setUploading(false);
    }
  }

  async function onRemoveAvatar() {
    setUploading(true);
    setMsg(null);
    try {
      if (!user) {
        throw new Error(
          "ユーザー情報が取得できていません。ページを再読み込みしてください。",
        );
      }

      await updateProfile(user, { photoURL: "" });
      await setDoc(
        doc(db, "organizations", ORG_ID, "members", user.uid),
        { photoURL: "" },
        { merge: true },
      );
      setAvatarUrl(DEFAULT_AVATAR);
      setAvatarFile(null);
      setMsg("アイコンを削除しました。");
    } catch (e: any) {
      setMsg(e?.message ?? "アイコンの削除に失敗しました。");
    } finally {
      setUploading(false);
    }
  }

  // 認証が必要な場合
  if (needLogin) {
    return <Navigate to="/login" replace />;
  }

  // Auth復元 or Firestore読み込み中
  if (!ready || !user) {
    return (
      <div className="p-6 text-sm text-gray-500">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">ユーザー設定</h1>

      {/* アイコン */}
      <section className="bg-white rounded-xl border border-black/5 p-4 mb-6">
        <h2 className="font-medium mb-3">アイコン</h2>
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || DEFAULT_AVATAR}
            alt="avatar"
            className="w-14 h-14 rounded-full object-cover border border-black/10"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          <div className="space-x-2">
            <label className="inline-flex items-center px-4 py-2 rounded-md border cursor-pointer hover:bg-black/5">
              画像を選択
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickAvatar}
              />
            </label>
            <button
              onClick={onSaveAvatar}
              disabled={uploading || !avatarFile}
              className={`px-4 py-2 rounded-md text-white ${
                uploading || !avatarFile
                  ? "bg-pink-300"
                  : "bg-pink-500 hover:bg-pink-600"
              }`}
            >
              {uploading ? "保存中…" : "アイコンを保存"}
            </button>
            <button
              onClick={onRemoveAvatar}
              disabled={uploading}
              className="px-4 py-2 rounded-md border hover:bg-black/5"
            >
              既定に戻す
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          推奨: 正方形の画像（小さめOK）。保存で反映されます。
        </p>
      </section>

      {/* 読み取り専用（法人・施設） */}
      <section className="bg-white rounded-xl border border-black/5 p-4 mb-6">
        <h2 className="font-medium mb-3">法人・施設情報</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Labeled label="法人名">
            <div className="text-gray-600">{ro.orgName}</div>
          </Labeled>
          <Labeled label="施設名">
            <div className="text-gray-600">{ro.facilityName}</div>
          </Labeled>
        </div>
      </section>

      {/* プロフィール編集 */}
      <section className="bg-white rounded-xl border border-black/5 p-4 mb-6">
        <h2 className="font-medium mb-3">プロフィール</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Labeled label="姓">
            <input
              className="w-full px-3 py-2 rounded-lg border"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Labeled>
          <Labeled label="名">
            <input
              className="w-full px-3 py-2 rounded-lg border"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Labeled>
          <Labeled label="メールアドレス" span={2}>
            <input
              className="w-full px-3 py-2 rounded-lg border"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Labeled>
        </div>
        <div className="mt-4">
          <button
            onClick={onSaveProfile}
            disabled={saving}
            className={`px-5 py-2 rounded-md text-white ${
              saving ? "bg-pink-300" : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            保存
          </button>
        </div>
      </section>

      {msg && <div className="mt-4 text-sm text-gray-700">{msg}</div>}

      {/* パスワード変更リンク */}
      <section className="bg-white rounded-xl border border-black/5 p-4 mt-6">
        <h2 className="font-medium mb-2">パスワード</h2>
        <p className="text-sm text-gray-600">
          パスワードの変更は専用ページから行えます。
        </p>
        <div className="mt-3">
          <a
            href="/password-reset"
            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-gray-700 hover:bg-gray-800"
          >
            パスワード変更はこちら
          </a>
        </div>
      </section>
    </div>
  );
}

function Labeled({
  label,
  children,
  span = 1,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2;
  hint?: string;
}) {
  return (
    <label className={`block ${span === 2 ? "sm:col-span-2" : ""}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {children}
      {hint && (
        <div className="text-[11px] text-gray-400 mt-1">
          {hint}
        </div>
      )}
    </label>
  );
}