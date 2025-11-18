// src/types/JobFields.ts
export type JobFieldType = "text" | "textarea";

export const JobFields = [
  // 基本
  { key: "title", label: "タイトル", type: "text" },
  { key: "wage", label: "給与", type: "text" },
  { key: "description", label: "説明（自由記述）", type: "textarea" },

  // 施設情報
  { key: "facilityName", label: "施設名", type: "text" },
  { key: "facilityAddress", label: "住所", type: "text" },
  { key: "facilityType", label: "施設種別", type: "text" },

  // 求人情報
  { key: "employmentType", label: "雇用形態", type: "text" },
  { key: "workingHours", label: "勤務時間", type: "text" },
  { key: "requirements", label: "必要資格・条件", type: "textarea" },
  { key: "benefits", label: "待遇・福利厚生", type: "textarea" },
] as const;
