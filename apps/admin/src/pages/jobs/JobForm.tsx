import React from "react";

export type JobDraft = {
  title: string;
  wage: string;
  description: string;
};

export default function JobForm({
  form,
  onChange,
}: {
  form: JobDraft;
  onChange: (v: JobDraft) => void;
}) {
  // null/undefined 安全化
  const f = form ?? { title: "", wage: "", description: "" };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm mb-1">タイトル</div>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="例）介護スタッフ（正職員）"
          value={f.title}
          onChange={(e) => onChange({ ...f, title: e.target.value })}
        />
      </div>

      <div>
        <div className="text-sm mb-1">給与</div>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="例）月給 23万円〜"
          value={f.wage}
          onChange={(e) => onChange({ ...f, wage: e.target.value })}
        />
      </div>

      <div>
        <div className="text-sm mb-1">仕事内容</div>
        <textarea
          className="w-full rounded-lg border px-3 py-2 min-h-[160px]"
          placeholder="主な業務内容や勤務時間、歓迎要件など"
          value={f.description}
          onChange={(e) => onChange({ ...f, description: e.target.value })}
        />
      </div>
    </div>
  );
}