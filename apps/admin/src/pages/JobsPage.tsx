// src/pages/JobsPage.tsx
import { useState } from "react";
import { JobForm } from "../components/JobForm";
import { JobTable } from "../components/JobTable";

export default function JobsPage() {
    // JobTableを再描画させるための、ちょっとしたテクニック
    const [version, setVersion] = useState(0);
    const refreshJobs = () => setVersion(v => v + 1);

    return (
        <div>
            <JobForm onJobCreated={refreshJobs} />
            {/* keyを渡すことで、JobFormでの作成後にJobTableを強制的に再描画させる */}
            <JobTable key={version} />
        </div>
    );
}