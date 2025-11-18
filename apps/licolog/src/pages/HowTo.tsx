// apps/licolog/src/pages/HowTo.tsx
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";

export default function HowToPage() {
  const [orgName, setOrgName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [userLabel, setUserLabel] = useState("");

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (!user) return;

      const orgSnap = await getDoc(doc(db, "organizations", "demo-org"));
      setOrgName(orgSnap.data()?.name || "");

      const mSnap = await getDoc(doc(db, "organizations", "demo-org", "members", user.uid));
      const m = mSnap.data() || {};
      setUserLabel(m.displayName || user.email || "");

      const facilityId = m.facilityId;
      if (facilityId) {
        const col = collection(db, "organizations", "demo-org", "facilities");
        const q = query(col, where("contractId", "==", facilityId), limit(1));
        const snap = await getDocs(q);
        const fd = snap.docs[0]?.data();
        setFacilityName(fd?.name || "");
      }
    })();
  }, []);

  return (
    <>
      <AppHeader
        orgName={orgName}
        facilityName={facilityName}
        userLabel={userLabel}
      />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-6">Licope の使い方</h1>

        <Section title="1. ログインとユーザー切り替え">
          <p className="text-sm leading-relaxed text-gray-700">
            Licope では、施設ごとにアカウントを発行します。
            デバイスを共用する場合は、右上メニューから「ログアウト」を行い、
            正しい利用者で再ログインしてください。
          </p>
        </Section>

        <Section title="2. リコログの投稿方法">
          <ol className="list-decimal ml-5 text-sm leading-relaxed text-gray-700 space-y-1">
            <li>トップ画面から「投稿する」を選びます。</li>
            <li>今日の出来事・気づきを入力します。</li>
            <li>必要に応じて画像を添付できます。</li>
            <li>「送信」を押すと管理者に送られます。</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            投稿内容は施設の管理者が確認し、公開を許可したものだけが採用LPに表示されます。
          </p>
        </Section>

        <Section title="3. 管理者用：投稿の承認方法">
          <p className="text-sm text-gray-700 leading-relaxed">
            管理画面にログインすると、左側に「リコログ管理」が表示されます。
            ここでは職員から送られた投稿を一覧で確認できます。
          </p>

          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1 mt-2">
            <li>公開する投稿 → 「承認」</li>
            <li>公開しない投稿 → 「非承認」</li>
          </ul>
        </Section>

        <Section title="4. 応募者管理の使い方">
          <p className="text-sm text-gray-700 leading-relaxed">
            採用LPから応募があると、管理画面の「応募者一覧」に追加されます。
            各応募者にはステータスを設定できます。
          </p>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1 mt-2">
            <li>未対応</li>
            <li>連絡済み</li>
            <li>面談調整中</li>
            <li>採用 / 不採用</li>
          </ul>
        </Section>

        <Section title="5. ユーザー設定（プロフィール・施設情報）">
          <p className="text-sm text-gray-700 leading-relaxed">
            右上メニュー → <Link className="underline" to="/settings">ユーザー設定</Link>
            からプロフィールやアイコンを編集できます。
          </p>
          <p className="text-xs text-gray-500 mt-2">
            法人名・施設名は管理権限により変更できません。
          </p>
        </Section>

        <Section title="6. よくある質問">
          <div className="mt-3 space-y-4">
            <FAQ
              q="投稿が表示されません"
              a="管理者の承認が必要です。管理画面でステータスをご確認ください。"
            />
            <FAQ
              q="施設名が間違っています"
              a="管理者アカウントが割り当てた facilityId と facilities.contractId の照合が必要です。管理者にお問い合わせください。"
            />
            <FAQ
              q="ログインできません"
              a="初期パスワードが不明な場合は、管理者に再発行してもらってください。"
            />
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-xl border border-black/5 p-4 mb-6">
      <h2 className="font-medium mb-3">{title}</h2>
      {children}
    </section>
  );
}

function FAQ({ q, a }) {
  return (
    <div>
      <p className="font-medium text-sm text-gray-800">Q. {q}</p>
      <p className="text-sm text-gray-700 mt-1 ml-4">A. {a}</p>
    </div>
  );
}