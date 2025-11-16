import React from "react";

export default function TokushoPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">特定商取引法に関する表記</h1>

      <section>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <dt className="font-semibold">販売業者</dt>
          <dd className="md:col-span-2">一般社団法人 グローカリゼーション</dd>

          <dt className="font-semibold">代表責任者</dt>
          <dd className="md:col-span-2">佐藤 孝</dd>

          <dt className="font-semibold">所在地</dt>
          <dd className="md:col-span-2">岩手県盛岡市本宮2丁目11番5号</dd>

          <dt className="font-semibold">電話番号</dt>
          <dd className="md:col-span-2">
            070-5325-5195
          </dd>

          <dt className="font-semibold">メールアドレス</dt>
          <dd className="md:col-span-2">support@licope.jp</dd>

          <dt className="font-semibold">サイトURL</dt>
          <dd className="md:col-span-2">https://licope.jp</dd>

          <dt className="font-semibold">販売価格</dt>
          <dd className="md:col-span-2">
            各商品・サービスの申込ページに表示（消費税込み／税抜表示の別も明記）。
          </dd>

          <dt className="font-semibold">商品代金以外の必要料金</dt>
          <dd className="md:col-span-2">
            消費税、振込手数料、通信料。物販がある場合は送料（申込ページに個別記載）。
          </dd>

          <dt className="font-semibold">お支払い方法</dt>
          <dd className="md:col-span-2">
            クレジットカード／銀行振込／その他決済（申込ページに記載）。
          </dd>

          <dt className="font-semibold">お支払い時期</dt>
          <dd className="md:col-span-2">
            サブスクリプションは利用開始日を起算日とし所定周期で自動課金。単発商品は申込時に前払い。
          </dd>

          <dt className="font-semibold">役務の提供時期</dt>
          <dd className="md:col-span-2">
            決済完了後、直ちにまたは申込ページに記載の時期に提供。
          </dd>

          <dt className="font-semibold">返品・キャンセル</dt>
          <dd className="md:col-span-2">
            デジタルサービスの性質上、提供後の返金・返品はお受けできません。提供不能や重大な瑕疵がある場合は個別に対応します。
          </dd>

          <dt className="font-semibold">解約条件</dt>
          <dd className="md:col-span-2">
            次回請求日の前日までにマイページまたはサポート窓口から解約手続き。解約後も当該請求期間の返金はありません。
          </dd>

          <dt className="font-semibold">動作環境</dt>
          <dd className="md:col-span-2">
            近年の主要ブラウザ最新版、JavaScript有効、安定したネットワーク環境。
          </dd>

          <dt className="font-semibold">特記事項</dt>
          <dd className="md:col-span-2">
            通信販売にはクーリング・オフ制度は適用されません。表現・再現性に関する注意：効果・成果には個人差があります。
          </dd>
        </dl>
      </section>
    </div>
  );
}