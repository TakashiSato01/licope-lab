import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

// 必須でなくてもOK。未設定ならログ出力のみで動作。
const SMTP_HOST = process.env.MAIL_SMTP_HOST;
const SMTP_PORT = process.env.MAIL_SMTP_PORT
  ? parseInt(process.env.MAIL_SMTP_PORT, 10)
  : undefined;
const SMTP_USER = process.env.MAIL_SMTP_USER;
const SMTP_PASS = process.env.MAIL_SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || "Licope <no-reply@licope.local>";
const MAIL_TO_DEFAULT = process.env.MAIL_TO_DEFAULT || "info@glocalization.jp";

function getTransport() {
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return null; // 未設定ならログ出力のみ
}

// 応募作成を契機にメール通知
export const onApplicationCreated = functions.firestore
  .document("organizations/{orgId}/applications/{appId}")
  .onCreate(async (snap, context) => {
    const data = snap.data() as {
      orgId: string;
      jobPubId: string;
      name: string;
      contact: string;
      message: string;
      createdAt?: FirebaseFirestore.Timestamp;
    };

    // 可能なら求人のタイトルを取得
    let title = "";
    try {
      const pj = await db
        .doc(`organizations/${data.orgId}/publicJobs/${data.jobPubId}`)
        .get();
      title = (pj.exists && (pj.data()?.title as string)) || "";
    } catch (_) {}

    const subject = title
      ? `【応募】${title} に新しい応募`
      : `【応募】新しい応募がありました`;

    const lines = [
      `応募者名: ${data.name}`,
      `連絡先: ${data.contact}`,
      title ? `対象求人: ${title}` : `求人ID: ${data.jobPubId}`,
      "",
      "メッセージ:",
      data.message || "(なし)",
      "",
      `応募ID: ${snap.id}`,
      `応募日時: ${data.createdAt?.toDate?.().toISOString?.() || ""}`,
    ];
    const text = lines.join("\n");

    const transporter = getTransport();
    if (!transporter) {
      console.log("[MAIL:DRYRUN]", { to: MAIL_TO_DEFAULT, subject, text });
      return;
    }

    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO_DEFAULT,
      subject,
      text,
    });
    // ==== 追加：求人公開ページの閲覧を日次カウント ====
    export const trackPublicJobView = functions.https.onCall(async (data, context) => {
      const orgId = String(data?.orgId || "");
      const pubId = String(data?.pubId || "");
      if (!orgId || !pubId) {
        throw new functions.https.HttpsError("invalid-argument", "orgId/pubId が必要です");
      }
      // 例: 2025-09-14
      const now = admin.firestore.Timestamp.now().toDate();
      const dateKey = now.toISOString().slice(0, 10);

      const dailyRef = db.doc(`organizations/${orgId}/metrics/views/daily/${dateKey}`);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(dailyRef);
        if (snap.exists) {
          tx.update(dailyRef, { count: admin.firestore.FieldValue.increment(1) });
        } else {
          tx.set(dailyRef, { orgId, date: dateKey, count: 1, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        }
      });
      return { ok: true };
    });
  });