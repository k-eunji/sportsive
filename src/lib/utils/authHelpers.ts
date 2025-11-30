// lib/utils/authHelpers.ts
import axios from "axios";

export const getErrorMessage = (code: string) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use.';
    case 'auth/invalid-email':
      return 'Invalid email format.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
      return 'User not found.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

// ✅ 닉네임 존재 여부 확인
export const checkNicknameExists = async (nickname: string): Promise<boolean> => {
  try {
    const res = await axios.get("/api/checkNickname", { params: { nickname } });
    return res.data.exists;
  } catch (err) {
    console.error("Failed to check nickname", err);
    return false;
  }
};
