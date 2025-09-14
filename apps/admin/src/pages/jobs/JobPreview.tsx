import React from "react";

type Props = {
  title: string;
  wage: string;
  description: string;
};

export default function JobPreview({ title, wage, description }: Props) {
  const safeTitle = title?.trim() || "（タイトル未入力）";
  const safeWage = wage?.trim() || "（給与未入力）";
  const safeDesc = description?.trim() || "（仕事内容が未入力です）";

  return (
    <article className="prose max-w-none">
      <h2 className="text-lg font-semibold">{safeTitle}</h2>
      <p className="text-[#3a3732]">
        <span className="inline-block text-xs px-2 py-1 rounded-full bg-[#faf1f4] mr-2">給与</span>
        {safeWage}
      </p>
      <hr className="my-4" />
      <h3 className="font-semibold mb-1">仕事内容</h3>
      <p className="whitespace-pre-wrap leading-relaxed">{safeDesc}</p>
    </article>
  );
}