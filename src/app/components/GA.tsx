//src/app/components/GA.tsx

"use client";

import Script from "next/script";

export default function GA() {

  // ✅ 여기에 넣으세요
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1WRHN39RC6"
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1WRHN39RC6');
        `}
      </Script>
    </>
  );
}
