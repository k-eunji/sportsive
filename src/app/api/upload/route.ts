// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";
import admin from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // 🔥 모바일 Safari/Chrome 에서 File → Blob 로만 오는 경우 대응
    if (!file || !(file instanceof Blob)) {
      console.error("❌ No valid file received:", file);
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 🔥 Blob → Buffer 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // Firestore Storage 버킷 가져오기
    const bucket = getStorage(admin.app()).bucket();

    // 파일명 고유 UUID 생성
    const fileName = `momvote/${uuidv4()}`;
    const fileRef = bucket.file(fileName);

    // 🔥 파일 업로드
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || "application/octet-stream",
      },
    });

    // 🔥 공개 URL 발급 (2030년까지 유효)
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("🔥 Upload error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
