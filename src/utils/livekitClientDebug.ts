//src/utils/livekitClientDebug.ts

import { Room, createLocalVideoTrack, createLocalAudioTrack } from "livekit-client";

export async function joinRoomDebugFull(token: string) {
  // 같은 PC 테스트: localhost
  // 다른 PC/모바일: LAN IP 사용 (예: 192.168.0.231)
  const url = "ws://192.168.0.231:7880";
  const room = new Room();

  // ✅ Room 이벤트 로그
  room.on("connected", () => console.log("✅ Room 이벤트: connected"));
  room.on("disconnected", () => console.log("⚠ Room 이벤트: disconnected"));
  room.on("reconnecting", () => console.log("🔄 Room 이벤트: reconnecting"));
  room.on("participantConnected", (p: any) => console.log("👤 참가자 연결:", p.identity));
  room.on("participantDisconnected", (p: any) => console.log("👤 참가자 나감:", p.identity));
  room.on("trackSubscribed", (track: any) => console.log("🎥 trackSubscribed:", track.kind));
  room.on("trackUnsubscribed", (track: any) => console.log("❌ trackUnsubscribed:", track.kind));

  try {
    // 🔹 LiveKit 연결
    await room.connect(url, token);
    console.log("✅ LiveKit 연결 성공");
  } catch (err) {
    console.error("❌ LiveKit 연결 실패", err);
    return room;
  }

  let videoTrack, audioTrack;
  try {
    // 🔹 로컬 트랙 생성
    videoTrack = await createLocalVideoTrack();
    audioTrack = await createLocalAudioTrack();
    console.log("🎥 로컬 트랙 생성 성공");
  } catch (err) {
    console.error("❌ 로컬 트랙 생성 실패", err);
    return room;
  }

  try {
    // 🔹 트랙 퍼블리시
    await room.localParticipant.publishTrack(videoTrack);
    await room.localParticipant.publishTrack(audioTrack);
    console.log("📡 로컬 트랙 퍼블리시 완료");
  } catch (err) {
    console.error("❌ 로컬 트랙 퍼블리시 실패", err);
  }

  try {
    // 🔹 화면에 붙이기
    const localVideoEl = videoTrack.attach();
    localVideoEl.width = 320;
    localVideoEl.height = 240;
    localVideoEl.autoplay = true;
    localVideoEl.playsInline = true;
    localVideoEl.muted = true; // 로컬은 반드시 muted
    localVideoEl.style.border = "1px solid #666";
    localVideoEl.style.margin = "5px";
    document.getElementById("videos")?.appendChild(localVideoEl);
    console.log("✅ 로컬 비디오 DOM에 붙이기 완료");
  } catch (err) {
    console.error("❌ 비디오 DOM 붙이기 실패", err);
  }

  return room;
}
