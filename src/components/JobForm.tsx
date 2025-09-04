// src/components/JobForm.tsx
import { FormEvent, useState } from "react";
import { createJob } from "../lib/data"; // 階層が深くなるのでパスを修正

// このコンポーネントが完了した後に実行してほしい関数を受け取る
interface JobFormProps {
    onJobCreated: () => void;
}

export function JobForm({ onJobCreated }: JobFormProps) {
    const [title, setTitle] = useState('');
    const [wage, setWage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title || !wage || Number(wage) <= 0) {
            alert("求人名と、0より大きい給与を入力してください。");
            return;
        }
        setSubmitting(true);
        try {
            await createJob({ title, wage: Number(wage) });
            setTitle('');
            setWage('');
            onJobCreated(); // 親に「終わったよ」と通知
        } catch (e) {
            console.error("データの作成に失敗しました。", e);
            alert("データの作成に失敗しました。");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card">
            <h2>新しい求人を作成</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="求人タイトル"
                    disabled={submitting}
                />
                <input
                    type="number"
                    value={wage}
                    onChange={(e) => setWage(e.target.value)}
                    placeholder="給与"
                    disabled={submitting}
                />
                <button type="submit" disabled={submitting}>
                    {submitting ? '作成中...' : '作成'}
                </button>
            </form>
        </div>
    );
}