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
   * ✅ GA 설정
   * - DebugView 활성화
   * - internal_user 구분
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    const isInternal =
      window.location.search.includes("internal=true") ||
      localStorage.getItem("sportsive_internal") === "true";

    if (window.location.search.includes("internal=true")) {
      localStorage.setItem("sportsive_internal", "true");
    }

    // ✅ GA4에 user_properties를 config 단계에서 명시
    window.gtag("config", "G-1WRHN39RC6", {
      debug_mode: true,
      user_properties: {
        internal_user: isInternal,
      },
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
