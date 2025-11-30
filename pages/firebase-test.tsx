// pages/firebase-test.tsx

import React from "react";
import { testFirebaseEmulator } from "@/utils/firebaseTest"; // ✅ 이름 통일

export default function FirebaseTestPage() {
  const handleClick = async () => {
    await testFirebaseEmulator(); // ✅ 이름 통일
  };

  return (
    <div>
      <h1>Firebase Emulator Test</h1>
      <button onClick={handleClick}>가입 또는 로그인 시도</button>
    </div>
  );
}
