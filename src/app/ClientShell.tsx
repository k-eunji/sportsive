"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/layout/Footer";
import IntroWrapper from "@/components/layout/IntroWrapper";
import { Toaster } from "react-hot-toast";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";

  /**
   * ✅ GA 안전 설정
   * - internal 판정은 개발환경에서만
   * - session 단위 (탭 닫으면 사라짐)
   * - GA Internal traffic 필터와 절대 결합되지 않음
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    const isDev = process.env.NODE_ENV === "development";

    // 개발 환경 + 명시적 쿼리일 때만 internal
    const isInternal =
      isDev && window.location.search.includes("internal=true");

    if (isInternal) {
      sessionStorage.setItem("sportsive_internal", "true");
    }

    // ❗ internal 판정은 "정보용 이벤트"로만 보냄
    // ❗ GA Internal traffic 필터 조건에 사용하면 안 됨
    window.gtag("event", "dev_diagnostic", {
      is_internal_dev: isInternal,
      environment: isDev ? "development" : "production",
      debug_mode: isDev,
    });
  }, []);

  const isHome = pathname === "/";
  const isLiveRoom =
    pathname.startsWith("/live/") && pathname.split("/").length === 4;

  const content = (
    <>
      <main
        className={
          isHome
            ? "min-h-screen"
            : "flex flex-col pt-24 px-4 pb-[calc(58px+env(safe-area-inset-bottom))]"
        }
      >
        <div className={isHome ? "" : "flex-1"}>{children}</div>
        {!isLiveRoom && !isHome && <Footer />}
      </main>

      <Toaster position="bottom-center" />
    </>
  );

  return isHome ? <IntroWrapper>{content}</IntroWrapper> : content;
}
