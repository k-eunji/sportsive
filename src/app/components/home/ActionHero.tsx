// src/app/components/home/ActionHero.tsx
"use client";

import SoftButton from "@/components/ui/SoftButton";

export default function ActionHero() {
  return (
    <section className="px-6 pt-2">
      <div className="w-full md:max-w-3xl md:mx-auto text-center space-y-3">
        <p className="text-[11px] uppercase tracking-widest text-red-600 font-medium">
          Local sport is happening — quietly.
        </p>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          See what’s near you right now
        </h1>

        <div className="pt-2 flex justify-center">
          <SoftButton as="link" href="#map" className="px-6 py-2.5">
            Surprise me nearby →
          </SoftButton>
        </div>
      </div>
    </section>
  );
}
