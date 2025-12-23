// src/app/api/upload/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";
import "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = getStorage().bucket();
    console.log("🔥 USING BUCKET:", bucket.name);

    const fileName = `uploads/${uuidv4()}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      resumable: false,
      metadata: { contentType: file.type },
    });

    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "2030-03-01",
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
