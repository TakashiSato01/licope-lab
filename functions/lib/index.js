"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackPublicJobView = exports.onApplicationCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
admin.initializeApp();
const db = admin.firestore();
// ── 環境変数（エミュではシェルから渡す）
const SMTP_HOST = process.env.MAIL_SMTP_HOST;
const SMTP_PORT = process.env.MAIL_SMTP_PORT ? parseInt(process.env.MAIL_SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.MAIL_SMTP_USER;
const SMTP_PASS = process.env.MAIL_SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || "info@licope.jp";
const MAIL_TO_DEFAULT = process.env.MAIL_TO_DEFAULT || "info@licope.jp";
function getTransport() {
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        const secure = SMTP_PORT === 465; // 465=SSL/TLS, 587=STARTTLS
        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
            // タイムアウトを短めにしてUIが待たされないように
            connectionTimeout: 10000,
            greetingTimeout: 10000,
        });
    }
    return null; // 未設定ならDRY-RUN
}
// 応募作成 → メール通知
exports.onApplicationCreated = functions.firestore
    .document("organizations/{orgId}/applications/{appId}")
    .onCreate(async (snap, context) => {
    try {
        const data = snap.data();
        // 求人タイトル（あれば）
        let title = "";
        try {
            const pj = await db.doc(`organizations/${data.orgId}/publicJobs/${data.jobPubId}`).get();
            title = (pj.exists && pj.data()?.title) || "";
        }
        catch { }
        const subject = title ? `【応募】${title} に新しい応募` : `【応募】新しい応募がありました`;
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
        const t = getTransport();
        if (!t) {
            console.log("[MAIL:DRYRUN] no SMTP config", { to: MAIL_TO_DEFAULT, subject, text });
            return;
        }
        try {
            const info = await t.sendMail({
                from: MAIL_FROM, // まずは "info@licope.jp" 単体で試すのが無難
                to: MAIL_TO_DEFAULT,
                subject,
                text,
            });
            console.log("[MAIL:SENT]", info.envelope);
        }
        catch (e) {
            console.error("[MAIL:ERROR]", e?.message || e);
            // ここで throw しない：通知失敗でも関数全体は成功終了にする
        }
    }
    catch (e) {
        console.error("[FUNCTION ERROR] onApplicationCreated", e?.message || e);
        // ここも throw しない（UIに影響させない）
    }
});
// 公開ページの閲覧カウント
exports.trackPublicJobView = functions.https.onCall(async (data) => {
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
        }
        else {
            tx.set(dailyRef, {
                orgId,
                date: dateKey,
                count: 1,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    });
    return { ok: true };
});
