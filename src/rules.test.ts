import { test, expect, describe, beforeAll, afterAll } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";

describe("Firestore Security Rules", () => {
    let testEnv: RulesTestEnvironment;

    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
          projectId: "licope-lab-test",
          firestore: {
            host: process.env.FIRESTORE_EMULATOR_HOST?.split(":")[0] ?? "127.0.0.1",
            port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(":")[1] ?? 8080),
        rules: fs.readFileSync("firestore.rules", "utf8"), }
    });
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    test("認証されていないユーザーは、jobsコレクションに書き込めない", async () => {
        const anonDb = testEnv.unauthenticatedContext().firestore();
        await assertFails(anonDb.collection("jobs").add({ title: "B" }));
    });

    test("認証されたユーザーは、jobsコレクションに書き込める", async () => {
        const authedDb = testEnv.authenticatedContext("user_abc").firestore();
        await assertSucceeds(authedDb.collection("jobs").add({ title: "A", wage: 1000 }));
    });
    
    test("オーナーではない認証ユーザーは、organizationsコレクションに書き込めない", async () => {
      const orgId = "org_xyz";
      const userId = "user_abc";

  // 事前準備: 管理者視点でシードデータ作成
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await ctx.firestore().doc(`organizations/${orgId}`).set({ name: "Initial Corp" });
    });

  // 検証: 認証済みでも一般ユーザーは書けない
      const userDb = testEnv.authenticatedContext(userId).firestore();
      await assertFails(userDb.doc(`organizations/${orgId}`).set({ name: "Test Corp" }));
  });

});