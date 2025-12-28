//src/app/components/SituationHero.tsx

export default function SituationHero() {
  return (
    <section className="py-16 text-center space-y-5 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Real sports matches<br />are happening near you.
      </h1>

      <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        But unless you already follow a team or a league,  
        you’ll probably never find them.
      </p>

      <p className="text-sm text-gray-500">
        Sportsive shows live and upcoming matches  
        based on your location and time — not teams.
      </p>

      <div className="pt-4">
        <a
          href="#map"
          className="
            inline-flex items-center gap-2
            text-base font-medium
            text-blue-600
            hover:underline
            underline-offset-4
          "
        >
          Show matches near me →
        </a>
      </div>
    </section>
  );
}
