import React from "react";

export default function AnalysisPage() {
  const updated = new Intl.DateTimeFormat("ja-JP").format(new Date());
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">近日公開予定</h1>
    </div>
  );
}