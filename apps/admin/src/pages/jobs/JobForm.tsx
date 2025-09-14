// apps/admin/src/pages/jobs/components/JobForm.tsx
export type JobFormState = {
  title: string;
  wage: string;        // まずは文字列でOK（あとで数値化）
  description: string; // textarea
};

export default function JobForm(props: {
  value: JobFormState;
  onChange: (v: JobFormState) => void;
}) {
  const v = props.value;
  const set = (patch: Partial<JobFormState>) => props.onChange({ ...v, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-600">タイトル</label>
        <input
          className="w-full rounded-xl border p-2"
          value={v.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="例）介護スタッフ（正職員）"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">給与</label>
        <input
          className="w-full rounded-xl border p-2"
          value={v.wage}
          onChange={(e) => set({ wage: e.target.value })}
          placeholder="例）月給 23万円〜"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">仕事内容</label>
        <textarea
          className="w-full rounded-xl border p-2 min-h-[160px]"
          value={v.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="主な業務内容や勤務時間、歓迎要件など"
        />
      </div>
    </div>
  );
}