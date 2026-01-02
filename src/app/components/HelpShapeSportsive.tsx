// src/app/components/HelpShapeSportsive.tsx

export default function HelpShapeSportsive() {
  return (
    <section
      className="
        max-w-xl mx-auto
        text-center text-sm text-gray-600
        space-y-4
        pt-8
        border-t border-border/60
      "
    >
      <p className="font-medium text-gray-800 dark:text-gray-200">
        This is still early
      </p>

      <p className="leading-relaxed">
        Sportsive is an early-stage experiment about how people find local
        sports.
        <br />
        <br />
        If it’s ever been harder than it should be to figure out what’s
        happening near you, I’d genuinely love to hear about it.
        <br />
        If you’re involved in a local or niche sport, I’d love to hear from you
        too.
      </p>

      <div className="flex justify-center gap-4 text-sm">
        <a
          href="https://www.instagram.com/sportsive_/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Sportsive on Instagram"
          className="text-blue-600 hover:underline underline-offset-4"
        >
          Message on Instagram
        </a>

        <a
          href="https://www.linkedin.com/in/kim-eg/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Connect with the founder on LinkedIn"
          className="text-blue-600 hover:underline underline-offset-4"
        >
          Connect on LinkedIn
        </a>
      </div>

      <p className="text-xs opacity-70">
        I read every message.
      </p>
    </section>
  );
}
