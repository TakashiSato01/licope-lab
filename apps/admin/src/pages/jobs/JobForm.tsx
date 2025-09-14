import type { JobDraft } from "./JobCreatePage";

export default function JobForm(props: {
  form: JobDraft;
  onChange: (patch: Partial<JobDraft>) => void;
  onSave: () => void;
  canSave: boolean;
  saving: boolean;
}) {
  const { form, onChange, onSave, canSave, saving } = props;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-gray-600 mb-1">タイトル</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="例）介護スタッフ（正職員）"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">給与</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="例）月給 23万円〜"
          value={form.wage}
          onChange={(e) => onChange({ wage: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">仕事内容</label>
        <textarea
          className="w-full min-h-[160px] rounded-lg border px-3 py-2"
          placeholder="主な業務内容や勤務時間、歓迎要件など"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="inline-flex items-center rounded-xl bg-[#f579a4] px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "保存中…" : "下書きを保存"}
        </button>
        <span className="ml-3 text-xs text-gray-500">
          ※ タイトルと給与が入力されていると保存できます
        </span>
      </div>
    </div>
  );
}