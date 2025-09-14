import React from "react";

type Props = {
  title: string;
  wage: string;
  description: string;
  onChangeTitle: (v: string) => void;
  onChangeWage: (v: string) => void;
  onChangeDescription: (v: string) => void;
};

export default function JobForm({
  title,
  wage,
  description,
  onChangeTitle,
  onChangeWage,
  onChangeDescription,
}: Props) {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block text-sm font-medium mb-1">求人タイトル</label>
        <input
          type="text"
          value={title ?? ""}                    // ← undefined防止でフォールバック
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f579a4]"
          placeholder="例）介護職（正職員）｜盛岡市"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">給与</label>
        <input
          type="text"
          value={wage ?? ""}
          onChange={(e) => onChangeWage(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f579a4]"
          placeholder="例）月給 210,000円〜"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">仕事内容</label>
        <textarea
          value={description ?? ""}
          onChange={(e) => onChangeDescription(e.target.value)}
          rows={10}
          className="w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f579a4]"
          placeholder="施設の特徴・求める人物像・シフト・福利厚生 など"
        />
      </div>
    </form>
  );
}