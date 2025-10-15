// apps/admin/src/pages/UserSettingsPage.tsx
import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { ORG_ID } from "@/lib/auth";
import { updateEmail, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

type ReadonlyInfo = {
  orgName: string;
  facilityName: string;
  uid: string;
};

export default function UserSettingsPage() {
  const user = auth.currentUser!;
  const [ro, setRo] = useState<ReadonlyInfo>({ orgName: "", facilityName: "", uid: user?.uid ?? "-" });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState(user?.email ?? "");
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<string | null>(null);
  const DEFAULT_AVATAR = "/assets/avatar-default.png";
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.photoURL || DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // パスワード変更用
  const [currPw, setCurrPw]       = useState("");
  const [newPw, setNewPw]         = useState("");
  const [newPw2, setNewPw2]       = useState("");

  // 読み取り専用の表示値（法人名・施設名）
  useEffect(() => {
    (async () => {
      try {
        // プロジェクトの実データに合わせて取得先を調整
        // 例: organizations/{ORG_ID}, facilities/{FACILITY_ID}
        const orgId = ORG_ID; // 既存の定数やコンテキストがあるなら差し替え
        const memberId = user.uid;

        const orgSnap = await getDoc(doc(db, "organizations", orgId));
        const memberSnap = await getDoc(doc(db, "organizations", orgId, "members", memberId));

        const orgName = (orgSnap.data()?.name as string) ?? "（不明な法人）";
        // members から契約ID（facilityId）を取得し、facilities で name を引く
        const facilityId = (memberSnap.data()?.facilityId as string) ?? "";
        let facilityName = "（不明な施設）";
        if (facilityId) {
          const col = collection(db, "organizations", orgId, "facilities");
          const q = query(col, where("contractId", "==", facilityId), limit(1));
          const snap = await getDocs(q);
          const d = snap.docs[0]?.data();
          if (d?.name) facilityName = String(d.name);
        }
        setRo({ orgName, facilityName, uid: user.uid });

        // 名前は displayName か members のフィールドから初期化
        const fn = (memberSnap.data()?.firstName as string) ?? (user.displayName?.split(" ")[1] ?? "");
        const ln = (memberSnap.data()?.lastName as string)  ?? (user.displayName?.split(" ")[0] ?? "");
        setFirstName(fn);
        setLastName(ln);

        // アイコンは Auth > members.photoURL > デフォルト の順
        const m = memberSnap.data() as any | undefined;
        const url = user.photoURL || m?.photoURL || DEFAULT_AVATAR;
        setAvatarUrl(url);
      } catch {
        setRo((p) => ({ ...p, orgName: "（取得エラー）", facilityName: "（取得エラー）" }));
      }
    })();
  }, [user]);

  async function onSaveProfile() {
    setMsg(null);
    setSaving(true);
    try {
      const displayName = [lastName, firstName].filter(Boolean).join(" ");
      await updateProfile(user, { displayName });
      await setDoc(
        doc(db, "organizations", ORG_ID, "members", user.uid),
        { firstName, lastName, displayName },
        { merge: true }
      );

      if (email && email !== user.email) {
        // 本番では再認証が必要になることがある
        if (currPw) {
          const cred = EmailAuthProvider.credential(user.email || "", currPw);
          await reauthenticateWithCredential(user, cred);
        }
        await updateEmail(user, email);
      }

      setMsg("プロフィールを保存しました。");
    } catch (e: any) {
      setMsg(e?.message ?? "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword() {
    setMsg(null);
    if (!newPw || newPw.length < 8) {
      setMsg("パスワードは8文字以上にしてください。");
      return;
    }
    if (newPw !== newPw2) {
      setMsg("新しいパスワードが一致しません。");
      return;
    }
    try {
      if (currPw) {
        const cred = EmailAuthProvider.credential(user.email || "", currPw);
        await reauthenticateWithCredential(user, cred);
      }
      await updatePassword(user, newPw);
      setMsg("パスワードを更新しました。");
      setCurrPw(""); setNewPw(""); setNewPw2("");
    } catch (e: any) {
      setMsg(e?.message ?? "パスワード更新に失敗しました。");
    }
  }

  // アバター画像選択
  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    // 即時プレビュー
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  }

  // アバター保存（Storage へアップ -> Auth と members を更新）
  async function onSaveAvatar() {
    if (!avatarFile) { setMsg("画像が選択されていません。"); return; }
    setUploading(true);
    setMsg(null);
    try {
      const path = `organizations/${ORG_ID}/members/${user.uid}/avatar_${Date.now()}.jpg`;
      const sref = ref(storage, path);
      await uploadBytes(sref, avatarFile, { contentType: avatarFile.type });
      const url = await getDownloadURL(sref);
      // Auth
      await updateProfile(user, { photoURL: url });
      // members
      await setDoc(
        doc(db, "organizations", ORG_ID, "members", user.uid),
        { photoURL: url },
        { merge: true }
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

  // アバター削除（Auth と members.photoURL をクリア）
  async function onRemoveAvatar() {
    setUploading(true);
    setMsg(null);
    try {
      await updateProfile(user, { photoURL: "" });
      await setDoc(
        doc(db, "organizations", ORG_ID, "members", user.uid),
        { photoURL: "" },
        { merge: true }
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

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold mb-6">ユーザー設定</h1>

     {/* アイコン */}
     <section className="bg-white rounded-xl border border-black/5 p-4 mb-6">
       <h2 className="font-medium mb-3">アイコン</h2>
       <div className="flex items-center gap-4">
         <img
           src={avatarUrl || DEFAULT_AVATAR}
           alt="avatar"
           className="w-14 h-14 rounded-full object-cover border border-black/10"
           onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
         />
         <div className="space-x-2">
           <label className="inline-flex items-center px-4 py-2 rounded-md border cursor-pointer hover:bg-black/5">
             画像を選択
             <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
           </label>
           <button
             onClick={onSaveAvatar}
             disabled={uploading || !avatarFile}
             className={`px-4 py-2 rounded-md text-white ${uploading || !avatarFile ? "bg-pink-300" : "bg-pink-500 hover:bg-pink-600"}`}
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
       <p className="mt-2 text-xs text-gray-500">推奨: 正方形の画像（小さめOK）。保存で反映されます。</p>
     </section>

      {/* 読み取り専用 */}
      <section className="bg-white rounded-xl border border-black/5 p-4 mb-6">
        <h2 className="font-medium mb-3">アカウント情報（変更不可）</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Labeled label="法人名"><div className="text-gray-600">{ro.orgName}</div></Labeled>
          <Labeled label="施設名"><div className="text-gray-600">{ro.facilityName}</div></Labeled>
          <Labeled label="ユーザーID"><div className="text-gray-600">{ro.uid}</div></Labeled>
        </div>
      </section>

      {/* プロフィール編集 */}
      <section className="bg-white rounded-xl border border-black/5 p-4 mb-6">
        <h2 className="font-medium mb-3">プロフィール</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Labeled label="姓">
            <input className="w-full px-3 py-2 rounded-lg border"
                   value={lastName} onChange={(e)=>setLastName(e.target.value)} />
          </Labeled>
          <Labeled label="名">
            <input className="w-full px-3 py-2 rounded-lg border"
                   value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
          </Labeled>
          <Labeled label="メールアドレス" span={2}>
            <input className="w-full px-3 py-2 rounded-lg border"
                   type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </Labeled>
          <Labeled label="（必要時）現在のパスワード" hint="メール変更やPW変更で求められる場合があります" span={2}>
            <input className="w-full px-3 py-2 rounded-lg border"
                   type="password" value={currPw} onChange={(e)=>setCurrPw(e.target.value)} />
          </Labeled>
        </div>
        <div className="mt-4">
          <button
            onClick={onSaveProfile}
            disabled={saving}
            className={`px-5 py-2 rounded-md text-white ${saving ? "bg-pink-300" : "bg-pink-500 hover:bg-pink-600"}`}
          >
            保存
          </button>
        </div>
      </section>

      {/* パスワード変更 */}
      <section className="bg-white rounded-xl border border-black/5 p-4">
        <h2 className="font-medium mb-3">パスワード変更</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Labeled label="新しいパスワード">
            <input className="w-full px-3 py-2 rounded-lg border"
                   type="password" value={newPw} onChange={(e)=>setNewPw(e.target.value)} />
          </Labeled>
          <Labeled label="新しいパスワード（確認）">
            <input className="w-full px-3 py-2 rounded-lg border"
                   type="password" value={newPw2} onChange={(e)=>setNewPw2(e.target.value)} />
          </Labeled>
        </div>
        <div className="mt-4">
          <button
            onClick={onChangePassword}
            className="px-5 py-2 rounded-md text-white bg-gray-700 hover:bg-gray-800"
          >
            パスワードを更新
          </button>
        </div>
      </section>

      {msg && <div className="mt-4 text-sm text-gray-700">{msg}</div>}
    </div>
  );
}

function Labeled({
  label, children, span = 1, hint,
}: { label: string; children: React.ReactNode; span?: 1 | 2; hint?: string }) {
  return (
    <label className={`block ${span === 2 ? "sm:col-span-2" : ""}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </label>
  );
}