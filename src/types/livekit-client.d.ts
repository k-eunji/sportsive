// src/types/livekit-client.d.ts

declare module "livekit-client" {
  export class Room {
    name: string; // ✅ 여기 추가
    on(event: string, callback: (...args: any[]) => void): void;
    localParticipant: any;
    connect(url: string, token: string): Promise<void>;
  }

  export class RemoteParticipant {
    identity: string;
  }

  export function createLocalVideoTrack(): Promise<any>;
  export function createLocalAudioTrack(): Promise<any>;
}
