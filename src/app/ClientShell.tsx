// src/app/ClientShell.tsx

"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const HEADER_HEIGHT = "pt-[50px]";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";

  const isHome = pathname === "/ops";
  const isLiveRoom =
    pathname.startsWith("/live/") && pathname.split("/").length === 4;

  return (
    <>
      {/* HEADER – 앱 홈에서는 숨김 */}
      {!isHome && <Header />}

      <main
        className={`
          min-h-screen
          ${!isHome ? HEADER_HEIGHT : ""}
          ${!isHome ? "flex flex-col px-4 pb-[calc(58px+env(safe-area-inset-bottom))]" : ""}
        `}
      >
        <div className={!isHome ? "flex-1" : ""}>
          {children}
        </div>

        {!isLiveRoom && !isHome && <Footer />}
      </main>

      <Toaster position="bottom-center" />
    </>
  );
}
