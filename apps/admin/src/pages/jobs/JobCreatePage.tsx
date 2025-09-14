import React, { useMemo, useState } from "react";
import JobForm, { JobDraft } from "./JobForm";
import JobPreview from "./JobPreview";
import { publishJob } from "@/lib/repositories/jobs";
import { useNavigate } from "react-router-dom";

const initial: JobDraft = { title: "", wage: "", description: "" };

export default function JobCreatePage() {
  const [form, setForm] = useState<JobDraft>(initial);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const canPublish = useMemo(
    () => form.title.trim().length > 0 && form.wage.trim().length > 0,
    [form]
  );

  async function onPublish() {
    try {
      setBusy(true);
      const { publicPath } = await publishJob(form);
      alert("公開しました！");
      // 一覧へ戻す & 新しいタブで公開ページを開く
      window.open(publicPath, "_blank", "noopener");
      navigate("/jobs");
    } catch (e: any) {
      console.error(e);
      alert(`公開に失敗しました: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">求人ページを作成</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* 左：入力 */}
        <div className="rounded-xl bg-white border border-black/5 p-4">
          <JobForm form={form} onChange={setForm} />
          <div className="mt-4">
            <button
              className="px-4 py-2 rounded-xl bg-[#f579a4] text-white disabled:opacity-50"
              disabled={!canPublish || busy}
              onClick={onPublish}
            >
              {busy ? "公開中…" : "公開"}
            </button>
          </div>
        </div>

        {/* 右：プレビュー */}
        <div className="rounded-xl bg-white border border-black/5 p-4">
          <JobPreview form={form} />
        </div>
      </div>
    </div>
  );
}