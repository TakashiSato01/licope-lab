import { useState } from "react";

const faqs = [
  { q: "トライアル期間はありますか？", a: "30日間の無料トライアルがあります。25日までに解約しなければ翌月から自動的に有料利用に移行します。" },
  { q: "契約は施設単位ですか？", a: "はい、法人単位ではなく施設単位での契約になります。" },
  { q: "利用料金はいくらですか？", a: "初月は 35,200円＋9,800円、以降は月額 9,800円です（税抜）。" },
  { q: "求人ページはどのように作成されますか？", a: "管理画面からフォーム入力するだけで、自動的に求人LPが生成されます。" },
  { q: "求人LPはどこに公開されますか？", a: "固有のURLが発行され、クリックで直接アクセスできます。施設HPやSNSからのリンク掲載も可能です。" },
  { q: "閲覧数は確認できますか？", a: "ダッシュボードで日別の閲覧数を確認できます。" },
  { q: "応募があった場合はどう通知されますか？", a: "メールで通知され、管理画面の応募一覧からも確認できます。" },
  { q: "応募データのダウンロードは可能ですか？", a: "CSVエクスポート機能は将来追加予定です。現状は一覧画面からコピー可能です。" },
  { q: "リコログ投稿は誰でもできますか？", a: "職員用アプリから匿名で投稿できますが、公開には管理者承認が必要です。" },
  { q: "写真投稿は可能ですか？", a: "現在はテキストのみ。将来的に写真投稿も対応予定です。" },
  { q: "リコログは求人ページにどう反映されますか？", a: "承認済みの最新3件が求人LPに自動で表示されます。" },
  { q: "セキュリティ対策は？", a: "FirestoreルールとStorageルールで厳格に制御しています。" },
  { q: "開発環境と本番環境はどうなっていますか？", a: "開発は Firebase Emulator Suite、本番は専用プロジェクトに分離します。" },
  { q: "データの保管場所は？", a: "Firebase (Google Cloud) の日本リージョンに保存されます。" },
  { q: "サポート体制は？", a: "管理画面からのお問い合わせ、メールサポートを提供しています。" },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold mb-6">よくある質問（FAQ）</h1>
      <div className="bg-white rounded-xl shadow divide-y">
        {faqs.map((item, idx) => (
          <div key={idx} className="p-4">
            <button
              className="w-full text-left font-medium flex justify-between items-center"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span>{item.q}</span>
              <span>{open === idx ? "−" : "+"}</span>
            </button>
            {open === idx && (
              <p className="mt-2 text-sm text-gray-600">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}