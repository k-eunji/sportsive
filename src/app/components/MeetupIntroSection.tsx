///src/app/components/MeetupIntroSection.tsx

"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function MeetupIntroSection() {
  return (
    <section className="relative mt-32 overflow-hidden rounded-3xl shadow-lg">

      {/* 🎉 콘텐츠 영역 */}
      <div className="relative z-10 text-center text-white py-24 px-8">
        <motion.h3
          className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          🎉 Watch Together, Cheer Louder
        </motion.h3>

        <motion.p
          className="text-gray-200 mb-10 max-w-2xl mx-auto text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Grab a pint, find your crew, and make every matchday unforgettable.  
          Whether it’s football, rugby, or cricket — the best games are shared.
        </motion.p>

        <motion.a
          href="/meetups"
          className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold 
                     px-10 py-4 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition"
          whileHover={{ scale: 1.05 }}
        >
          <Users className="w-6 h-6" />
          Join a Local Meetup
        </motion.a>
      </div>
    </section>
  );
}
