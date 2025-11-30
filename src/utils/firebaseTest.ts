// src/utils/firebaseTest.ts
import axios from "axios";

export async function testFirebaseEmulator() {
  const testEmail = "newuser@emulator.com";
  const testPassword = "password123";
  const testNickname = "emulatorTest";

  try {
    const res = await axios.post("/api/test/createUser", {
      email: testEmail,
      password: testPassword,
      authorNickname: testNickname,
    });
    console.log("✅ 유저 생성 성공:", res.data);
  } catch (err: any) {
    if (err.response?.status === 409) {
      console.warn("⚠️ 사용자 이미 존재 → 로그인 시도");
      try {
        const loginRes = await axios.post("/api/test/login", {
          email: testEmail,
          password: testPassword,
        });
        console.log("✅ 로그인 성공:", loginRes.data);
      } catch (loginErr) {
        console.error("❌ 로그인 실패:", loginErr);
      }
    } else {
      console.error("❌ 유저 생성 실패:", err);
    }
  }

  try {
    const dataRes = await axios.post("/api/test/createUserData", {
      email: testEmail,
      authorNickname: testNickname,
    });
    console.log("📦 테스트 데이터 생성 성공:", dataRes.data);
  } catch (dataErr) {
    console.error("❌ 테스트 데이터 생성 실패:", dataErr);
  }
}
