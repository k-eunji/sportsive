/// <reference types="leaflet" />
/// <reference types="google.maps" />

declare module "*.css";

export {};

declare global {
  interface Window {
    google: typeof google;
    gtag?: (...args: any[]) => void;
  }

  // ✅ google.maps 네임스페이스 강제 확립
  namespace google.maps {
    export interface Map {}
    export interface Marker {}
    export interface Geocoder {}
    export interface LatLng {}
  }


  // ⭐⭐⭐ Web Share API 타입 추가 — navigator.share 빨간줄 제거
  interface Navigator {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data?: ShareData) => boolean;
    clipboard: {
      writeText(text: string): Promise<void>;
    };
  }

  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
  }
}