import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function ApplyPage() {
  const { orgId = "demo-org", pubId = "" } = useParams();
 // 入力ステート
 const [name, setName] = useState("");
 const [contact, setContact] = useState("");
 const [message, setMessage] = useState("");

 // バリデーション用
 const [errors, setErrors] = useState<{name?:string; contact?:string}>({});

 // ステップ（input | confirm | done）
 const [step, setStep] = useState<"input" | "confirm" | "done">("input");

 // ===========================
 // ▼ 入力チェック
 // ===========================
 function validate(): boolean {
   const next: any = {};

   if (!name.trim()) next.name = "お名前は必須です。";

   // contact: email or tel
   const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
   const telRegex = /^[0-9+\-() ]{8,}$/;

   if (!contact.trim()) {
     next.contact = "連絡先は必須です。";
   } else if (!emailRegex.test(contact) && !telRegex.test(contact)) {
     next.contact = "メールアドレスまたは電話番号の形式が不正です。";
   }

   setErrors(next);
   return Object.keys(next).length === 0;
 }

 // ===========================
 // ▼ 1) 入力 → 確認へ
 // ===========================
 function handleConfirm(e: React.FormEvent) {
   e.preventDefault();
   if (!validate()) return;
   setStep("confirm");
 }

 // ===========================
 // ▼ 2) 確認 → 送信
 // ===========================
 async function handleSubmit() {
   await addDoc(collection(db, `organizations/${orgId}/applications`), {
     orgId,
     jobPubId: pubId,
     name,
     contact,
     message,
     createdAt: serverTimestamp(),
     status: "pending"
   });
   setStep("done");
 }

  if (step === "done")
    return (
      <div className="p-6 max-w-xl">
        応募を受け付けました。ありがとうございました！
      </div>
    );

  // ===========================
  // ▼ STEP 1: 入力画面
  // ===========================
  if (step === "input")
    return (
      <div className="p-6 max-w-xl">
        <div className="text-xl font-bold mb-4">応募フォーム</div>
        <form
          onSubmit={handleConfirm}
          className="space-y-3 bg-white rounded-2xl p-4 border border-black/5"
        >
        <div>
          <label className="block text-sm mb-1">お名前</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
           {errors.name && (
              <div className="text-red-500 text-xs mt-1">{errors.name}</div>
           )}
        </div>

        <div>
          <label className="block text-sm mb-1">連絡先</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="メール or 電話"
          />
           {errors.contact && (
             <div className="text-red-500 text-xs mt-1">{errors.contact}</div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">メッセージ（任意）</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

         <button className="rounded-xl bg-[#f579a4] text-white px-4 py-2">
           入力内容を確認する
         </button>
      </form>
    </div>
  );

 // ===========================
 // ▼ STEP 2: 確認画面
 // ===========================
 if (step === "confirm")
   return (
     <div className="p-6 max-w-xl space-y-4">
       <div className="text-xl font-bold">入力内容の確認</div>

       <div className="bg-white rounded-xl p-4 border border-black/5 space-y-3">
         <div>
           <div className="text-sm text-gray-500">お名前</div>
           <div>{name}</div>
         </div>
         <div>
           <div className="text-sm text-gray-500">連絡先</div>
           <div>{contact}</div>
         </div>
         <div>
           <div className="text-sm text-gray-500">メッセージ</div>
           <div className="whitespace-pre-wrap">{message || "（なし）"}</div>
         </div>
       </div>

       <div className="flex gap-3">
         <button
           onClick={() => setStep("input")}
           className="px-4 py-2 rounded-xl border border-gray-400"
         >
           修正する
         </button>

         <button
           onClick={handleSubmit}
           className="px-4 py-2 rounded-xl bg-[#f579a4] text-white"
         >
           この内容で送信する
         </button>
       </div>
     </div>
   );
}