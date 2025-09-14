import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

/* ... nodemailer 設定はそのまま ... */

// 1) 応募作成→ メール通知
export const onApplicationCreated = functions.firestore
  .document("organizations/{orgId}/applications/{appId}")
  .onCreate(async (snap) => {
    const data = snap.data() as {
      orgId: string; jobPubId: string; name: string; contact: string; message?: string;
      createdAt?: FirebaseFirestore.Timestamp;
    };

    let title = "";
    try {
      const pj = await db.doc(`organizations/${data.orgId}/publicJobs/${data.jobPubId}`).get();
      title = (pj.exists && (pj.data()?.title as string)) || "";
    } catch {}

    const subject = title ? `【応募】${title} に新しい応募` : `【応募】新しい応募がありました`;
    const lines = [
      `応募者名: ${data.name}`,
      `連絡先: ${data.contact}`,
      title ? `対象求人: ${title}` : `求人ID: ${data.jobPubId}`,
      "", "メッセージ:", data.message || "(なし)", "",
      `応募ID: ${snap.id}`, `応募日時: ${data.createdAt?.toDate?.().toISOString?.() || ""}`,
    ];
    const text = lines.join("\n");

    const t = getTransport();
    if (!t) { console.log("[MAIL:DRYRUN]", { to: MAIL_TO_DEFAULT, subject, text }); return; }
    await t.sendMail({ from: MAIL_FROM, to: MAIL_TO_DEFAULT, subject, text });
  });

// 2) 公開ページ閲覧のカウント（callable）
export const trackPublicJobView = functions.https.onCall(async (data) => {
  const orgId = String(data?.orgId || "");
  const pubId = String(data?.pubId || "");
  if (!orgId || !pubId) {
    throw new functions.https.HttpsError("invalid-argument", "orgId/pubId が必要です");
  }
  const now = admin.firestore.Timestamp.now().toDate();
  const dateKey = now.toISOString().slice(0, 10);

  const dailyRef = db.doc(`organizations/${orgId}/metrics/views/daily/${dateKey}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(dailyRef);
    if (snap.exists) {
      tx.update(dailyRef, { count: admin.firestore.FieldValue.increment(1) });
    } else {
      tx.set(dailyRef, {
        orgId, date: dateKey, count: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
  return { ok: true };
});