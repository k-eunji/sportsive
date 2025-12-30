// src/app/auth/layout.tsx

'use client';

import { useUser } from '@/context/UserContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { authReady } = useUser();

  // auth 확인 전에는 렌더 X
  if (!authReady) return null;

  return (
    <main className="min-h-dvh flex items-center justify-center bg-gray-50/60 px-4 py-8 font-sans text-gray-900">
      <section className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6 tracking-tight">
          Sportsive
        </h1>
        {children}
      </section>
    </main>
  );
}
