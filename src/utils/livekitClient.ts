// src/utils/livekitClient.ts

import { Room, createLocalVideoTrack, createLocalAudioTrack } from "livekit-client";

export async function joinRoom(token: string, useLAN = false) {
  const url = useLAN
    ? process.env.NEXT_PUBLIC_LIVEKIT_URL_LAN!     // 같은 Wi-Fi LAN PC 테스트용
    : process.env.NEXT_PUBLIC_LIVEKIT_URL_EXTERNAL!; // 외부/모바일 테스트용 (ngrok)

  const room = new Room();

  room.on("connected", () => console.log("✅ Room connected"));
  room.on("disconnected", () => console.log("⚠ Room disconnected"));
  room.on("participantConnected", p => console.log("👤 참가자 연결:", p.identity));

  await room.connect(url, token);

  const videoTrack = await createLocalVideoTrack();
  const audioTrack = await createLocalAudioTrack();

  await room.localParticipant.publishTrack(videoTrack);
  await room.localParticipant.publishTrack(audioTrack);

  const videoEl = videoTrack.attach();
  videoEl.width = 320;
  videoEl.height = 240;
  videoEl.autoplay = true;
  videoEl.playsInline = true;
  videoEl.muted = true;

  document.getElementById("videos")?.appendChild(videoEl);

  return room;
}
