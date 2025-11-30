// ✅ src/app/api/upload/route.ts

import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";
import admin from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // 🔥 모바일 Safari/Chrome 대응 — File 대신 Blob 체크
    if (!file || !(file instanceof Blob)) {
      console.log("❌ No file (or mobile Blob issue) — file=", file);
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 🔥 Blob → Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `momvote/${uuidv4()}`;
    const bucket = getStorage(admin.app()).bucket();
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || "application/octet-stream",
      },
    });

    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("🔥 Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
