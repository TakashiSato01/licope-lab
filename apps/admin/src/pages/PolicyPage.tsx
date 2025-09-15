import React from "react";

export default function PolicyPage() {
  const updated = new Intl.DateTimeFormat("ja-JP").format(new Date());
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">プライバシーポリシー</h1>

      <section className="space-y-4">
        <p>
          一般社団法人グローカリゼーション（以下「当社」）は、本サービスの提供に際し、利用者の個人情報・ユーザー情報を以下の方針で取り扱います。
        </p>

        <h2 className="text-xl font-semibold mt-6">1. 取得する情報</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>氏名、メールアドレス、所属等のアカウント情報</li>
          <li>ログイン識別子、端末情報、IPアドレス、アクセスログ</li>
          <li>決済に必要な情報（決済事業者側で処理し、当社はカード番号等の秘匿情報を保持しません）</li>
          <li>ユーザーが投稿・アップロードするテキスト、画像、動画等のコンテンツ</li>
          <li>お問い合わせ時の内容</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">2. 利用目的</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>本人確認、認証、アカウント管理</li>
          <li>サービスの提供、保守、品質改善、新機能開発</li>
          <li>料金請求、不正利用の防止</li>
          <li>問い合わせ対応、重要なお知らせの送付</li>
          <li>統計・分析（個人を特定しない形での利用）</li>
          <li>法令遵守、紛争対応</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">3. 外部送信・委託・第三者提供</h2>
        <p>
          認証基盤、データ保管、決済処理、アクセス解析、エラーログ収集等のため、国内外のクラウド事業者に情報が送信されることがあります。提供先とは機密保持・適切な契約を締結し、必要最小限の範囲で取り扱います。法令に基づく場合を除き、本人の同意なく第三者に提供しません。
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Cookie 等</h2>
        <p>
          本サービスは利便性向上やアクセス解析のためCookie等を利用します。ブラウザ設定で無効化できますが、一部機能に支障が出る場合があります。
        </p>

        <h2 className="text-xl font-semibold mt-6">5. 安全管理措置</h2>
        <p>
          アクセス制御、暗号化、権限管理、ログ監査等の合理的な安全管理措置を講じます。
        </p>

        <h2 className="text-xl font-semibold mt-6">6. 保有期間</h2>
        <p>
          利用目的の達成に必要な期間、または法令で定める期間保有し、不要になった情報は適切に削除します。
        </p>

        <h2 className="text-xl font-semibold mt-6">7. 開示等の請求</h2>
        <p>
          利用者は、保有個人データの開示・訂正・利用停止・削除を求めることができます。下記窓口にご連絡ください。
        </p>

        <h2 className="text-xl font-semibold mt-6">8. 事業者・お問い合わせ窓口</h2>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
          <dt className="font-semibold">事業者名</dt><dd className="md:col-span-2">一般社団法人グローカリゼーション</dd>
          <dt className="font-semibold">所在地</dt><dd className="md:col-span-2">岩手県盛岡市本宮２丁目11番5号</dd>
          <dt className="font-semibold">メール</dt><dd className="md:col-span-2">support@licope.jp</dd>
        </dl>

        <h2 className="text-xl font-semibold mt-6">9. 改定</h2>
        <p>
          本ポリシーは予告なく改定する場合があります。重要な変更は本サービス内で通知します。
        </p>

        <p className="text-sm text-gray-500 mt-6">最終更新日：{updated}</p>
      </section>
    </div>
  );
}