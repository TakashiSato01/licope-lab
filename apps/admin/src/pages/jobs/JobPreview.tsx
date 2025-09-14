// apps/admin/src/pages/jobs/components/JobPreview.tsx
export default function JobPreview(props: {
  title: string;
  wage: string;
  description: string;
}) {
  return (
    <article className="prose max-w-none">
      <h1>{props.title || "（タイトル未入力）"}</h1>
      <p className="text-pink-600 font-semibold">{props.wage || "（給与未入力）"}</p>
      <hr />
      <p style={{ whiteSpace: "pre-wrap" }}>
        {props.description || "（仕事内容の説明がここに表示されます）"}
      </p>
    </article>
  );
}