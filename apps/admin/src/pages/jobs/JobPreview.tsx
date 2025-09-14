import type { JobDraft } from "./JobCreatePage";

export default function JobPreview({ form }: { form: JobDraft }) {
  const title = form.title.trim() || "（タイトル未入力）";
  const wage = form.wage.trim() || "（給与未入力）";
  const description =
    form.description.trim() || "（仕事内容の説明がここに表示されます）";

  return (
    <div className="space-y-3">
      <h4 className="text-xl font-bold">{title}</h4>
      <div className="text-[#f579a4] font-medium">{wage}</div>
      <p className="text-sm leading-6 whitespace-pre-wrap">{description}</p>

      {/* 後々の見え方の置き場（モジュール化していける） */}
      <div className="mt-4 rounded-lg border bg-gray-50 p-3 text-xs text-gray-600">
        ここは公開ページの見え方を想定した簡易プレビューです。  
        余裕ができたら UI をリッチにしていきましょう。
      </div>
    </div>
  );
}