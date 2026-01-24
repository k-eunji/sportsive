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
   * ✅ GA DebugView 강제 활성화
   * - DebugView에 이벤트 표시
   * - internal_user 확인용
   */
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("set", {
        debug_mode: true,
      });
    }
  }, []);

  const isHome = pathname === "/";
  const isLiveRoom =
    pathname.startsWith("/live/") && pathname.split("/").length === 4;

  const content = (
    <>
      {/* {!isLiveRoom && !isHome && <Header showLogo />} */}

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

  useEffect(() => {
    const isInternal =
      typeof window !== "undefined" &&
      (window.location.search.includes("internal=true") ||
        localStorage.getItem("sportsive_internal") === "true");

    if (window.location.search.includes("internal=true")) {
      localStorage.setItem("sportsive_internal", "true");
    }

    window.gtag?.("set", {
      debug_mode: true,
      internal_user: isInternal,
    });
  }, []);


  return isHome ? <IntroWrapper>{content}</IntroWrapper> : content;
}
