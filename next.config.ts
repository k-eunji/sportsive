// @ts-nocheck

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Turbopack 제거용 (빈 객체라도 넣어야 함)
  turbopack: {},

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "crests.football-data.org" },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
      { protocol: "https", hostname: "firebasestorage.app" },
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
    ],
  },

};
