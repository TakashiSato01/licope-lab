import React from "react";
import type { JobDraft } from "./JobForm";

export default function JobPreview({ form }: { form: JobDraft }) {
  const f = form ?? { title: "", wage: "", description: "" };
  return (
    <div>
      <div className="text-sm text-gray-500 mb-2">（プレビュー）</div>
      <h3 className="text-xl font-bold mb-2">
        {f.title || "（タイトル未入力）"}
      </h3>
      <div className="mb-2">
        <span className="text-sm font-medium">給与：</span>
        <span>{f.wage || "（給与未入力）"}</span>
      </div>
      <div className="text-sm whitespace-pre-wrap">
        {f.description || "（仕事内容の説明がここに表示されます）"}
      </div>
    </div>
  );
}