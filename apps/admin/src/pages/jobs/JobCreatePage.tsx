// src/pages/jobs/JobCreatePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { JobDraft } from "@/types/JobDraft";
import { publishJob } from "@/lib/repositories/jobs";
import JobForm from "./JobForm";
import JobPreview from "./JobPreview";

type DraftState = JobDraft & {
  thumbFile?: File | null;
  thumbPreviewURL?: string | null;
};

export default function JobCreatePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<DraftState>({
    title: "",
    wage: "",
    description: "",

    facilityName: "",
    facilityAddress: "",
    facilityType: "",

    employmentType: "",
    workingHours: "",
    requirements: "",
    benefits: "",

    thumbnailURL: null,
    thumbnailPath: null,

    thumbFile: null,
    thumbPreviewURL: null,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (draft.thumbPreviewURL) URL.revokeObjectURL(draft.thumbPreviewURL);
    };
  }, [draft.thumbPreviewURL]);

  const handleField = (patch: Partial<DraftState>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const handleThumbSelect = (file: File | null) => {
    if (draft.thumbPreviewURL) URL.revokeObjectURL(draft.thumbPreviewURL);
    if (file) {
      const url = URL.createObjectURL(file);
      setDraft((prev) => ({ ...prev, thumbFile: file, thumbPreviewURL: url }));
    } else {
      setDraft((prev) => ({ ...prev, thumbFile: null, thumbPreviewURL: null }));
    }
  };

  async function onSubmit() {
    if (submitting) return;
    if (!draft.title.trim()) {
      alert("タイトルを入力してください。");
      return;
    }

    setSubmitting(true);
    try {
      await publishJob(
        {
          ...draft,
          thumbnailURL: null,
          thumbnailPath: null,
        },
        { thumbnailFile: draft.thumbFile ?? null }
      );
      navigate("/jobs");
    } catch (e) {
      console.error(e);
      alert("公開に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">求人ページ作成</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white border border-black/5 p-4">
          <JobForm
            draft={draft}
            onChange={handleField}
            thumbPreviewURL={draft.thumbPreviewURL || null}
            onSelectThumb={handleThumbSelect}
            submitting={submitting}
            onSubmit={onSubmit}
            submitLabel="この内容で公開"
          />
        </div>

        <div className="rounded-xl bg-white border border-black/5 p-4">
<JobPreview
  job={draft}                       // これが JobDraft である必要がある
  thumbnailURL={draft.thumbPreviewURL || null}
/>
        </div>
      </div>
    </div>
  );
}
