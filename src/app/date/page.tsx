// src/app/date/page.tsx

import { redirect } from "next/navigation";

export default function DateIndexPage() {
  const today = new Date().toISOString().slice(0, 10);
  redirect(`/date/${today}`);
}