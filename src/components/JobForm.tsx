export function JobForm({ onJobCreated }: { onJobCreated?: () => void }) {
  return (
    <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
      <div className="text-sm mb-2">JobForm (stub)</div>
      <button className="px-3 py-1 rounded bg-[#f579a4] text-white" onClick={onJobCreated}>
        ダミー作成
      </button>
    </div>
  );
}
