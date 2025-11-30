// src/types/next.d.ts
import "next";

// ✅ Next.js 15의 PageProps, RouteContext 타입 버그 임시 수정
declare module "next" {
  interface PageProps {
    params: { [key: string]: string };
  }

  interface RouteContext {
    params: { [key: string]: string };
  }
}
