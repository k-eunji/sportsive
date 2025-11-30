// src/server/generateToken.js

import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_KEY = process.env.LIVEKIT_KEY || "devkey";
const LIVEKIT_SECRET = process.env.LIVEKIT_SECRET || "mysuperlongsecretkeythatis32charsmin";

const identity = "user_" + Math.floor(Math.random() * 1000);
const roomName = "testRoom";

(async () => {
  const at = new AccessToken(LIVEKIT_KEY, LIVEKIT_SECRET, { identity, ttl: "1h" });

  // 🔹 room 권한 추가
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();
  console.log("Room:", roomName);
  console.log("Identity:", identity);
  console.log("Token:", token);

  // 🔹 디코딩 확인
  const payloadBase64 = token.split('.')[1];
  const payloadJSON = Buffer.from(payloadBase64, 'base64').toString('utf8');
  console.log("Decoded Token Payload:", payloadJSON);
})();
