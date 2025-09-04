// src/components/JobTable.tsx
import { useState, useEffect } from "react";
import { listJobs } from "../lib/data"; // パスを修正

// Jobデータの型定義（複数の場所で使うので、将来的には別のファイルに切り出すと良い）
interface JobData {
    title: string;
    wage: number;
    createdAt: { seconds: number; nanoseconds: number; };
}
interface Job extends JobData { id: string; }

export function JobTable() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // このコンポーネントが表示された時に、Job一覧を取得する
    useEffect(() => {
        async function fetchJobs() {
            // ... (中身はApp.tsxからそのままコピー)
            try {
                const jobDocs = await listJobs();
                setJobs(jobDocs as Job[]);
            } catch (e: any) {
                setError(`データの取得に失敗しました: ${e.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, []);

    return (
        <div className="card">
            <h2>求人一覧</h2>
            {loading && <p>読み込み中...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <table>
                    <thead>
                        <tr><th>タイトル</th><th>給与</th><th>作成日時</th></tr>
                    </thead>
                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.id}>
                                <td>{job.title}</td>
                                <td>{job.wage.toLocaleString()}円</td>
                                <td>{new Date(job.createdAt.seconds * 1000).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}