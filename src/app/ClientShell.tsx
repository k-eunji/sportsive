// src/app/ClientShell.tsx

"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import IntroWrapper from "@/components/layout/IntroWrapper";
import { Toaster } from "react-hot-toast";

export default function ClientShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname() ?? "";   // ⭐ 빨간줄 해결 핵심

  const isHome = pathname === "/";

  const isLiveRoom =
    pathname.startsWith("/live/") && pathname.split("/").length === 4;

  const content = (
    <>
      {!isLiveRoom && <Header showLogo />}
      <main className="flex flex-col min-h-screen pt-24 pb-[6rem] px-4">
        <div className="flex-1">{children}</div>
        {!isLiveRoom && <Footer />}
      </main>
      {!isLiveRoom && <BottomNav />}
      <Toaster position="bottom-center" />
    </>
  );

  return isHome ? <IntroWrapper>{content}</IntroWrapper> : content;
}
