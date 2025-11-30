// src/app/test/page.tsx

"use client";

import { useEffect } from "react";

export default function TestPage() {
  console.log("🟢 페이지 렌더링됨 (서버)");

  useEffect(() => {
    console.log("🟢 useEffect 실행됨 (클라이언트)");
  }, []);

  return <div>테스트 페이지</div>;
}
