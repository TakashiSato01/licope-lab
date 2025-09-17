// apps/admin/src/pages/jobs/JobPreview.tsx
import React from "react";

export default function JobPreview(props: {
  title: string;
  wage: string;
  description: string;
  thumbnailURL: string | null;
}) {
  return (
    <div className="space-y-4">
      {/* サムネイル */}
      <div className="w-full h-40 rounded-xl overflow-hidden border border-black/10 bg-gray-50 grid place-items-center">
        {props.thumbnailURL ? (
          <img src={props.thumbnailURL} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">NO IMAGE</span>
        )}
      </div>

      {/* タイトル */}
      <h2 className="text-xl font-semibold">
        {props.title || "（タイトル未入力）"}
      </h2>

      {/* 給与 */}
      <div className="text-pink-600 font-medium">
        {props.wage || "（給与未入力）"}
      </div>

      {/* 説明 */}
      <div className="prose prose-sm max-w-none">
        {props.description ? (
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">
            {props.description}
          </pre>
        ) : (
          <div className="text-gray-500">説明が未入力です。</div>
        )}
      </div>
    </div>
  );
}