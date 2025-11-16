import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db, storage } from "@/lib/firebase";
import { ORG_ID } from "@/lib/auth";
import { useOrgRole } from "@/hooks/useOrgRole";
import {
  doc, getDoc, setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminMemberDetailPage() {
  const { id } = useParams<{id:string}>();
  const uid = auth.currentUser?.uid || "";
  const { role, loading } = useOrgRole(uid);
  const nav = useNavigate();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [facilityId, setFacilityId] = useState("");   // 読み取りのみ
  const [mrole, setMrole] = useState("");             // 読み取りのみ
  const [photoURL, setPhotoURL] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const s = await getDoc(doc(db, "organizations", ORG_ID, "members", id));
      const d = s.data() as any;
      if (!d) return;
      setLastName(d.lastName ?? "");
      setFirstName(d.firstName ?? "");
      setJobTitle(d.jobTitle ?? "");
      setEmail(d.email ?? "");
      setFacilityId(d.facilityId ?? "");
      setMrole(d.role ?? "");
      setPhotoURL(d.photoURL ?? "");
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!role || (role !== "owner" && role !== "admin")) return <div className="p-6">権限がありません。</div>;

  async function onSave() {
    if (!id) return;
    setSaving(true);
    let newURL = photoURL;
    if (file) {
      const path = `orgs/${ORG_ID}/members/${id}/avatar_${Date.now()}.jpg`;
      await uploadBytes(ref(storage, path), file);
      newURL = await getDownloadURL(ref(storage, path));
    }
    await setDoc(
      doc(db, "organizations", ORG_ID, "members", id),
      {
        lastName, firstName, jobTitle, email,
        ...(newURL ? { photoURL: newURL } : {}),
      },
      { merge: true }
    );
    setSaving(false);
    nav("/admin/members");
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">職員詳細</h1>

      <section className="bg-white p-4 rounded-xl border border-black/5 space-y-4">
        <div className="flex items-center gap-4">
          <img src={photoURL || "/assets/avatar-default.png"} className="w-16 h-16 rounded-full object-cover border" />
          <label className="inline-flex items-center px-3 py-2 border rounded-lg cursor-pointer">
            画像を選択
            <input type="file" accept="image/*" className="hidden"
              onChange={(e)=>{ const f=e.target.files?.[0]||null; setFile(f); if (f) setPhotoURL(URL.createObjectURL(f)); }} />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <L label="姓"><input className="w-full border rounded-lg px-3 py-2" value={lastName} onChange={e=>setLastName(e.target.value)} /></L>
          <L label="名"><input className="w-full border rounded-lg px-3 py-2" value={firstName} onChange={e=>setFirstName(e.target.value)} /></L>
          <L label="業務"><input className="w-full border rounded-lg px-3 py-2" value={jobTitle} onChange={e=>setJobTitle(e.target.value)} /></L>
          <L label="メール（任意）"><input className="w-full border rounded-lg px-3 py-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} /></L>
        </div>

        {/* 読み取り専用：所属施設・ロール */}
        <div className="grid sm:grid-cols-2 gap-4">
          <L label="所属施設（契約ID）">
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={facilityId} readOnly />
          </L>
          <L label="ロール">
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={mrole} readOnly />
          </L>
        </div>

        <div className="pt-2">
          <button onClick={onSave} disabled={saving} className={`px-4 py-2 rounded-md text-white ${saving ? "bg-pink-300" : "bg-pink-500 hover:bg-pink-600"}`}>
            保存
          </button>
        </div>
      </section>
    </div>
  );
}

function L({label, children}:{label:string; children:React.ReactNode}) {
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {children}
    </label>
  );
}