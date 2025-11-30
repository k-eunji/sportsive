// src/types/live.ts

export interface Message {
  id: string;
  user: string;          // 보낸 사람 ID 또는 닉네임
  content: string;
  timestamp: string;     // ISO 문자열
  text: string;
  userId: string;
  createdAt?: any;
}
