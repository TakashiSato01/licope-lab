import { useState } from "react";
import JobForm from "./JobForm";           // ← あなたのファイル名に合わせて
import JobPreview from "./JobPreview";     // ← 同上
import { saveJobDraft } from "@/lib/repositories/jobs";

export type JobDraft = {
  title: string;
  wage: string;
  description: string;
};

export default function JobCreatePage() {
  const [form, setForm] = useState<JobDraft>({
    title: "",
    wage: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (patch: Partial<JobDraft>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const canSave = form.title.trim() !== "" && form.wage.trim() !== "";

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const id = await saveJobDraft(form);
      alert(`下書きを保存しました（id: ${id}）`);
      // 必要なら /jobs へ遷移:
      // navigate("/jobs");
    } catch (e: any) {
      alert(`保存に失敗しました: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 p-6"
         style={{ gridTemplateColumns: "minmax(560px, 720px) 1fr" }}>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">求人ページを作成</h2>
        <JobForm
          form={form}
          onChange={handleChange}
          onSave={onSave}
          canSave={canSave}
          saving={saving}
        />
      </section>

      <aside className="bg-white rounded-xl shadow-sm border sticky top-6 h-fit p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-600">プレビュー</h3>
        <JobPreview form={form} />
      </aside>
    </div>
  );
}