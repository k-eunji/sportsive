// src/lib/uploadToStorage.ts
import { storage } from "@/lib/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadToStorage(file: File): Promise<string> {
  const fileRef = ref(
    storage,
    `uploads/${Date.now()}-${file.name}`
  );

  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
