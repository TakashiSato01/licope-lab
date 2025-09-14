// apps/admin/src/pages/jobs/JobCreatePage.tsx
import React, { useState } from "react";
import JobForm, { JobFormValue } from "./JobForm";
import JobPreview from "./JobPreview";
import { publishJob } from "@/lib/repositories/jobs";
import { useNavigate } from "react-router-dom";

export default function JobCreatePage() {
  const [form, setForm] = useState<JobFormValue>({
    title: "",
    wage: "",
    description: "",
  });
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  const onPublish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      const { publicPath } = await publishJob(form);
      // 成功 → 一覧へ戻す & 新しいタブで公開URLを開く
      window.open(publicPath, "_blank", "noopener");
      navigate("/jobs", { replace: true });
    } catch (e: any) {
      alert(`公開に失敗しました: ${e?.message ?? e}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">求人ページを作成</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobForm value={form} onChange={setForm} onPublish={onPublish} publishing={publishing} />
        <JobPreview value={form} />
      </div>
    </div>
  );
}