// src/types/JobDraft.ts
export type JobDraft = {
  // --- 求人タイトル＆給与 ---
  title: string;
  wage: string;

  // --- 詳細説明 ---
  description: string;

  // --- 施設情報 ---
  facilityName: string;
  facilityAddress: string;
  facilityType: string;

  // --- 求人情報 ---
  employmentType: string;
  workingHours: string;
  requirements: string;
  benefits: string;

  // --- サムネ ---
  thumbnailURL?: string | null;
  thumbnailPath?: string | null;
};

// JobDraft のキー一覧（ループ生成用）
export const JOB_FIELDS: { key: keyof JobDraft; label: string; type: "text" | "textarea" }[] = [
  { key: "title", label: "タイトル", type: "text" },
  { key: "wage", label: "給与", type: "text" },
  { key: "description", label: "説明（自由記述）", type: "textarea" },

  { key: "facilityName", label: "施設名", type: "text" },
  { key: "facilityAddress", label: "施設住所", type: "text" },
  { key: "facilityType", label: "施設種別", type: "text" },

  { key: "employmentType", label: "雇用形態", type: "text" },
  { key: "workingHours", label: "勤務時間", type: "text" },
  { key: "requirements", label: "必要資格・条件", type: "textarea" },
  { key: "benefits", label: "待遇・福利厚生", type: "textarea" },
];
