// src/pages/jobs/JobPreview.tsx
import React from "react";
import type { JobDraft } from "../../types/JobDraft";
import { JOB_FIELDS } from "../../types/JobDraft";

export default function JobPreview({
  job,
  thumbnailURL,
}: {
  job: JobDraft;
  thumbnailURL: string | null;
}) {
  return (
    <div className="space-y-6">
      {/* サムネ */}
      <div className="w-full h-40 rounded-xl overflow-hidden border bg-gray-50 grid place-items-center">
        {thumbnailURL ? (
          <img src={thumbnailURL} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">NO IMAGE</span>
        )}
      </div>

      {/* JobDraft の内容全部を自動描画 */}
      {JOB_FIELDS.map((f) => (
        <div key={f.key} className="space-y-1">
          <div className="text-sm font-semibold">{f.label}</div>

          {f.type === "textarea" ? (
            <pre className="whitespace-pre-wrap text-sm">
              {job[f.key] || "未入力"}
            </pre>
          ) : (
            <div className="text-sm">{job[f.key] || "未入力"}</div>
          )}
        </div>
      ))}
    </div>
  );
}
