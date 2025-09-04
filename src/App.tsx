// src/App.tsx
import { useState, useEffect, FormEvent } from 'react';
import { createJob, listJobs } from './lib/data';
import './App.css'; // あとでCSSを追加するための準備

// Jobデータの型を定義（設計図）
interface Job {
    id: string;
    title: string;
    wage: number;
    createdAt: number;
}

function App() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [title, setTitle] = useState('');
    const [wage, setWage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 最初に一度だけJob一覧を取得する
    useEffect(() => {
        async function fetchJobs() {
            try {
                const jobDocs = await listJobs();
                setJobs(jobDocs as Job[]);
            } catch (e) {
                setError("データの取得に失敗しました。");
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, []);

    // フォームが送信された時の処理
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title || wage <= 0) {
            alert("求人名と給与を入力してください。");
            return;
        }
        try {
            await createJob({ title, wage });
            setTitle('');
            setWage(0);
            // データを再取得して一覧を更新
            const updatedJobs = await listJobs();
            setJobs(updatedJobs as Job[]);
        } catch (e) {
            setError("データの作成に失敗しました。");
            console.error(e);
        }
    };

    return (
        <div className="app-container">
            <h1>Licope-Lab: Job Board v2</h1>
            
            <div className="card">
                <h2>新しい求人を作成</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="求人タイトル"
                    />
                    <input
                        type="number"
                        value={wage
                        onChange={(e) => setWage(Number(e.target.value))}
                        placeholder="給与"
                    />
                    <button type="submit">作成</button>
                </form>
            </div>

            <div className="card">
                <h2>求人一覧</h2>
                {loading && <p>読み込み中...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {!loading && !error && (
                    <table>
                        <thead>
                            <tr>
                                <th>タイトル</th>
                                <th>給与</th>
                                <th>作成日時</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.id}>
                                    <td>{job.title}</td>
                                    <td>{job.wage.toLocaleString()}円</td>
                                    <td>{new Date(job.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default App;