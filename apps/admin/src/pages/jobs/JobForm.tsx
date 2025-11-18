// src/pages/jobs/JobForm.tsx
import React, { useRef } from "react";
import type { JobDraft } from "../../types/JobDraft";
import { JOB_FIELDS } from "../../types/JobDraft";

export default function JobForm(props: {
  draft: JobDraft;
  thumbPreviewURL: string | null;
  onChange: (patch: Partial<JobDraft>) => void;
  onSelectThumb: (file: File | null) => void;
  submitting: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const d = props.draft;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
    >
      {/* --- サムネ --- */}
      <div>
        <label className="block text-sm font-medium mb-1">サムネイル画像</label>
        <div className="flex items-start gap-4">
          <div className="w-40 h-28 rounded-lg overflow-hidden border bg-gray-50 grid place-items-center">
            {props.thumbPreviewURL ? (
              <img src={props.thumbPreviewURL} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[11px] text-gray-400">NO IMAGE</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => props.onSelectThumb(e.target.files?.[0] ?? null)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                画像を選択
              </button>

              {props.thumbPreviewURL && (
                <button
                  type="button"
                  onClick={() => {
                    if (fileRef.current) fileRef.current.value = "";
                    props.onSelectThumb(null);
                  }}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 動的生成フィールド --- */}
      {JOB_FIELDS.map((f) =>
        f.type === "text" ? (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              value={d[f.key] ?? ""}
              onChange={(e) => props.onChange({ [f.key]: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
              placeholder={f.label}
            />
          </div>
        ) : (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <textarea
              value={d[f.key] ?? ""}
              onChange={(e) => props.onChange({ [f.key]: e.target.value })}
              rows={6}
              className="w-full rounded-lg border px-3 py-2"
              placeholder={f.label}
            />
          </div>
        )
      )}

      <button
        type="submit"
        disabled={props.submitting}
        className={`px-5 py-2 rounded-xl font-semibold text-white ${
          props.submitting ? "bg-pink-300" : "bg-[#f579a4]"
        }`}
      >
        {props.submitting ? "送信中…" : props.submitLabel ?? "保存"}
      </button>
    </form>
  );
}
