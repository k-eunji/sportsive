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

  const isOps = pathname === "/ops" || pathname.startsWith("/ops/");
  const isLiveRoom =
    pathname.startsWith("/live/") && pathname.split("/").length === 4;

  return (
    <>
      {/* HEADER – /ops 전체에서는 숨김 */}
      {!isOps && <Header />}

      <main
        className={`
          min-h-screen
          ${!isOps ? HEADER_HEIGHT : ""}
          ${!isOps ? "flex flex-col px-4 pb-[calc(58px+env(safe-area-inset-bottom))]" : ""}
        `}
      >
        <div className={!isOps ? "flex-1" : ""}>
          {children}
        </div>

        {!isLiveRoom && !isOps && <Footer />}
      </main>

      <Toaster position="bottom-center" />
    </>
  );
}
