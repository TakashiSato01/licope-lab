import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { ORG_ID } from "@/lib/auth";
import { useOrgRole } from "@/hooks/useOrgRole";
import { Navigate } from "react-router-dom";
import {
  doc, getDoc, setDoc, collection, getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminSettingsPage() {
  const uid = auth.currentUser?.uid || "";
  const { role, loading } = useOrgRole(uid);

  const [orgName, setOrgName] = useState("");
  const [brandColor, setBrandColor] = useState("#f579a4");
  const [logoURL, setLogoURL] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [facilities, setFacilities] = useState<Array<{id:string; name:string; contractId:string}>>([]);

  useEffect(() => {
    (async () => {
      const orgRef = doc(db, "organizations", ORG_ID);
      const orgSnap = await getDoc(orgRef);
      const d = orgSnap.data() as any;
      if (d?.name) setOrgName(d.name);
      if (d?.brand?.color) setBrandColor(d.brand.color);
      if (d?.brand?.logoPath) {
        try {
          const url = await getDownloadURL(ref(storage, d.brand.logoPath));
          setLogoURL(url);
        } catch {}
      }
      const col = collection(db, "organizations", ORG_ID, "facilities");
      const snap = await getDocs(col);
      setFacilities(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!role || (role !== "owner" && role !== "admin")) return <Navigate to="/" replace />;

  async function saveOrg() {
    const orgRef = doc(db, "organizations", ORG_ID);
    let logoPath: string | undefined;
    if (file) {
      logoPath = `public/orgs/${ORG_ID}/brand/logo_${Date.now()}.png`;
      await uploadBytes(ref(storage, logoPath), file);
    }
    await setDoc(orgRef, {
      name: orgName,
      brand: { color: brandColor, ...(logoPath ? { logoPath } : {}) }
    }, { merge: true });
    alert("保存しました");
    if (logoPath) {
      const url = await getDownloadURL(ref(storage, logoPath));
      setLogoURL(url);
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <h1 className="text-xl font-semibold">環境設定（管理）</h1>

      {/* 組織プロファイル */}
      <section className="bg-white p-4 rounded-xl border border-black/5">
        <h2 className="font-medium mb-3">組織プロファイル</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <L label="法人名">
            <input className="w-full border rounded-lg px-3 py-2" value={orgName} onChange={e=>setOrgName(e.target.value)} />
          </L>
          <L label="ブランドカラー">
            <input type="color" value={brandColor} onChange={e=>setBrandColor(e.target.value)} />
          </L>
          <L label="ロゴ">
            <div className="flex items-center gap-3">
              {logoURL && <img src={logoURL} alt="" className="h-10" />}
              <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            </div>
          </L>
        </div>
        <div className="mt-4">
          <button onClick={saveOrg} className="px-4 py-2 rounded-md text-white bg-pink-500 hover:bg-pink-600">保存</button>
        </div>
      </section>

      {/* 施設一覧（閲覧のみ） */}
      <section className="bg-white p-4 rounded-xl border border-black/5">
        <h2 className="font-medium mb-3">施設（閲覧）</h2>
        <ul className="space-y-2">
          {facilities.map(f => (
            <li key={f.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gray-500">契約ID: {f.contractId}</div>
              </div>
            </li>
          ))}
        </ul>
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