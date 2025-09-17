// apps/admin/src/pages/jobs/JobForm.tsx
import React, { useRef } from "react";

export default function JobForm(props: {
  title: string;
  wage: string;
  description: string;
  onChange: (patch: Partial<{ title: string; wage: string; description: string }>) => void;
  // サムネ
  thumbPreviewURL: string | null;
  onSelectThumb: (file: File | null) => void;
  // 操作
  submitting: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
    >
      {/* サムネイル */}
      <div>
        <label className="block text-sm font-medium mb-1">サムネイル画像</label>
        <div className="flex items-start gap-4">
          <div className="w-40 h-28 rounded-lg overflow-hidden border border-black/10 bg-gray-50 grid place-items-center">
            {props.thumbPreviewURL ? (
              <img src={props.thumbPreviewURL} alt="" className="w-full h-full object-cover" />
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
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                props.onSelectThumb(f);
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-sm"
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
                  className="px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-sm"
                >
                  削除
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">JPG/PNG 推奨。4MB 以内。</p>
          </div>
        </div>
      </div>

      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium mb-1">タイトル</label>
        <input
          value={props.title}
          onChange={(e) => props.onChange({ title: e.target.value })}
          className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300"
          placeholder="求人タイトル"
        />
      </div>

      {/* 給与 */}
      <div>
        <label className="block text-sm font-medium mb-1">給与</label>
        <input
          value={props.wage}
          onChange={(e) => props.onChange({ wage: e.target.value })}
          className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300"
          placeholder="例）時給1,200円〜"
        />
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium mb-1">説明</label>
        <textarea
          value={props.description}
          onChange={(e) => props.onChange({ description: e.target.value })}
          rows={8}
          className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 resize-vertical"
          placeholder="業務内容、条件、歓迎スキルなど"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={props.submitting}
          className={`px-5 py-2 rounded-xl font-semibold text-white ${
            props.submitting ? "bg-pink-300 cursor-not-allowed" : "bg-[#f579a4] hover:opacity-90"
          }`}
        >
          {props.submitting ? "送信中…" : props.submitLabel ?? "この内容で公開"}
        </button>
      </div>
    </form>
  );
}