// src/pages/jobs/JobEditPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { JobDraft } from "@/types/JobDraft";
import { updatePublishedJob } from "@/lib/repositories/jobs";
import JobForm from "./JobForm";
import JobPreview from "./JobPreview";

type DraftState = JobDraft & {
  thumbFile?: File | null;
  thumbPreviewURL?: string | null;
};

const ORG_ID = "demo-org";

export default function JobEditPage() {
  const { id } = useParams<{ id: string }>();
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

  // Firestore の既存データ購読
  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(
      doc(db, `organizations/${ORG_ID}/publicJobs/${id}`),
      (snap) => {
        const d = snap.data() as any;
        if (!d) return;

        setDraft((prev) => ({
          ...prev,
          title: d.title ?? "",
          wage: d.wage ?? "",
          description: d.description ?? "",

          facilityName: d.facilityName ?? "",
          facilityAddress: d.facilityAddress ?? "",
          facilityType: d.facilityType ?? "",

          employmentType: d.employmentType ?? "",
          workingHours: d.workingHours ?? "",
          requirements: d.requirements ?? "",
          benefits: d.benefits ?? "",

          thumbnailURL: d.thumbnailURL ?? null,
          thumbnailPath: d.thumbnailPath ?? null,

          thumbFile: null,
          thumbPreviewURL: prev.thumbFile
            ? prev.thumbPreviewURL
            : d.thumbnailURL ?? null,
        }));
      }
    );

    return () => unsub();
  }, [id]);

  // cleanup
  useEffect(() => {
    return () => {
      if (draft.thumbPreviewURL && draft.thumbFile)
        URL.revokeObjectURL(draft.thumbPreviewURL);
    };
  }, [draft.thumbPreviewURL, draft.thumbFile]);

  const handleField = (patch: Partial<DraftState>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const handleThumbSelect = (file: File | null) => {
    if (draft.thumbPreviewURL) URL.revokeObjectURL(draft.thumbPreviewURL);
    if (file) {
      const url = URL.createObjectURL(file);
      setDraft((prev) => ({ ...prev, thumbFile: file, thumbPreviewURL: url }));
    } else {
      setDraft((prev) => ({
        ...prev,
        thumbFile: null,
        thumbPreviewURL: draft.thumbnailURL ?? null,
      }));
    }
  };

  async function onSubmit() {
    if (!id) return;
    if (submitting) return;

    if (!draft.title.trim()) {
      alert("タイトルを入力してください。");
      return;
    }

    setSubmitting(true);
    try {
      await updatePublishedJob(
        id,
        {
          ...draft,
        },
        { thumbnailFile: draft.thumbFile ?? null }
      );
      navigate("/jobs");
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">求人ページを編集</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white border border-black/5 p-4">
          <JobForm
            draft={draft}
            onChange={handleField}
            thumbPreviewURL={draft.thumbPreviewURL || null}
            onSelectThumb={handleThumbSelect}
            submitting={submitting}
            onSubmit={onSubmit}
            submitLabel="この内容で更新"
          />
        </div>

        <div className="rounded-xl bg-white border border-black/5 p-4">
<JobPreview
  job={draft}                       // これが JobDraft である必要がある
  thumbnailURL={draft.thumbPreviewURL || null}
/>        </div>
      </div>
    </div>
  );
}
