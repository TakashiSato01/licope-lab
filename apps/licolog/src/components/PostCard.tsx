export default function PostCard({ post }: { post: any }) {
  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="whitespace-pre-wrap">{post.body}</p>
      <div className="text-xs opacity-60 mt-2">{post.createdAt}</div>
    </article>
  );
}
