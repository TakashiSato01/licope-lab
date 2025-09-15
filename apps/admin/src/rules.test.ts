// apps/admin/src/rules.test.ts
import { describe, it, beforeAll, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

describe("Firestore Security Rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "licope-lab-test",
      firestore: {
        host: process.env.FIRESTORE_EMULATOR_HOST?.split(":")[0] ?? "127.0.0.1",
        port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(":")[1] ?? 8080),
        rules: fs.readFileSync(
          path.resolve(process.cwd(), "firestore.rules"),
          "utf8"
        ),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  // 未ログインは publicJobs を作成できない
  it("未ログインは organizations/{orgId}/publicJobs に書き込めない", async () => {
    const orgId = "demo-org";
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      setDoc(doc(db, `organizations/${orgId}/publicJobs/ANONPUB`), {
        orgId,
        title: "NG",
        storagePath: "public/orgs/demo-org/jobs/ANONPUB.json",
        publishedAt: serverTimestamp(),
        publishedBy: "anon",
      })
    );
  });

  // editor は発行できる
  it("認証された editor は organizations/{orgId}/publicJobs に発行できる", async () => {
    const orgId = "demo-org";
    const uid = "user_editor";

    // seed: members/{uid}.role = "editor"
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), `organizations/${orgId}/members/${uid}`),
        { role: "editor", email: "editor@example.com", displayName: "Editor" }
      );
    });

    const db = testEnv.authenticatedContext(uid).firestore();

    await assertSucceeds(
      setDoc(doc(db, `organizations/${orgId}/publicJobs/TESTPUB1`), {
        orgId,
        title: "テスト求人",
        storagePath: "public/orgs/demo-org/jobs/TESTPUB1.json",
        publishedAt: serverTimestamp(),
        publishedBy: uid,
      })
    );
  });

  // 一般ユーザーは org 本体を更新できない
  it("オーナーではない認証ユーザーは organizations/{orgId} を更新できない", async () => {
    const orgId = "org_xyz";
    const uid = "user_abc";

    // seed: org doc
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `organizations/${orgId}`), {
        name: "Initial Corp",
      });
    });

    const db = testEnv.authenticatedContext(uid).firestore();
    await assertFails(
      setDoc(doc(db, `organizations/${orgId}`), { name: "Updated Corp" })
    );
  });
});