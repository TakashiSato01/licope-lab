// apps/admin/src/pages/JobCreatePage.tsx
import { useState } from "react";
import JobForm from "./JobForm";           // ← ファイル名/Export 名を一致させる
import JobPreview from "./JobPreview";
import { saveJobDraft } from "@/lib/repositories/jobs";

export default function JobCreatePage() {
  const [form, setForm] = useState({ title: "", wage: "", description: "" });
  const [saving, setSaving] = useState(false);

  const onChange = (next: typeof form) => setForm(next);

  const onSave = async () => {
    setSaving(true);
    try {
      const id = await saveJobDraft(form);
      alert(`下書きを保存しました: ${id}`);
      // ここで一覧へ戻すなど
      // navigate("/jobs");
    } catch (e: any) {
      alert(`保存に失敗しました: ${e.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">求人ページを作成</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JobForm value={form} onChange={onChange} onSave={onSave} saving={saving} />
        <JobPreview value={form} />
      </div>
    </div>
  );
}