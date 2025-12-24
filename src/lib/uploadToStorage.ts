// src/lib/uploadToStorage.ts
import { storage } from "@/lib/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadToStorage(file: File): Promise<string> {
  console.log("🟡 uploadToStorage called", {
    name: file.name,
    size: file.size,
    type: file.type,
    storage,
  });

  const fileRef = ref(
    storage,
    `uploads/${Date.now()}-${file.name}`
  );

  try {
    const snap = await uploadBytes(fileRef, file);
    console.log("🟢 upload success", snap.metadata.fullPath);

    const url = await getDownloadURL(fileRef);
    console.log("🟢 download URL", url);

    return url;
  } catch (err: any) {
    console.error("🔴 uploadToStorage error", err);
    throw err;
  }
}
