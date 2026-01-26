"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* =========================
          HERO
      ========================= */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="mb-6 select-none">
          <span className="font-extrabold text-[3.2rem] leading-none">
            sp
            <span className="inline-block bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-blue-500 text-transparent bg-clip-text">
              o
            </span>
            rtsive
          </span>
        </div>

        <p className="text-lg text-muted-foreground max-w-md">
          Check what sports are happening near you, right now.
        </p>

        <p className="text-xs text-muted-foreground mt-6 max-w-md">
          Built to understand how people discover live sports around them — before they plan anything.
        </p>

      </section>

      {/* =========================
          WHAT IT IS / IS NOT
      ========================= */}
      <section className="px-6 py-20 max-w-2xl mx-auto space-y-14">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            NOT A FAN PLATFORM
          </p>
          <p className="mt-3 text-xl font-medium">
            You don’t need to follow teams, leagues, or schedules.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            JUST A CHECK
          </p>
          <p className="mt-3 text-xl font-medium">
            Open Sportsive anytime to see what’s actually happening nearby.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            LOCATION & TIME FIRST
          </p>
          <p className="mt-3 text-xl font-medium">
            Every event is shown by where and when it’s happening — nothing else.
          </p>
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}
      <section className="px-6 pb-16 max-w-xl mx-auto w-full">
        <Link
          href="/app"
          className="
            block w-full
            text-center
            rounded-2xl
            bg-black text-white
            py-4
            text-sm font-semibold
            hover:opacity-90
            transition
          "
        >
          Open full-screen map
        </Link>

      </section>

      {/* =========================
          HELP SHAPE SPORTSIVE (FOOTER)
      ========================= */}
      <section
        className="
          max-w-xl mx-auto
          text-center
          text-xs
          text-muted-foreground
          space-y-4
          pt-8
          pb-10
          border-t border-border/60
          px-6
        "
      >
        <p className="font-medium text-foreground">
          This is an early experiment.
        </p>
        <p className="text-[11px] opacity-70">
          Built and maintained by a single creator as a live product experiment.
        </p>


        <p className="leading-relaxed">
          If there’s a match or event you think should be here,
          or if something feels missing, I’d love to hear from you.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="https://www.instagram.com/sportsive_/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/kim-eg/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            LinkedIn
          </a>
        </div>

        <p className="opacity-70">
          I read every message.
        </p>
      </section>
    </main>
  );
}
