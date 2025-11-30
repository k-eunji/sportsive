// src/app/fanhub/components/TodayMatchCarousel.tsx

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export type CarouselMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  date: string;
};

export default function TodayMatchCarousel({
  matches,
  label = "MATCH",
}: {
  matches: CarouselMatch[];
  label?: string;
}) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="w-full h-[50px] flex items-center px-3 mb-1">

      {/* 🔥 라벨 */}
      <div className="shrink-0 text-[12px] font-semibold opacity-80 pr-3 flex items-center h-full">
        {label}
      </div>

      {/* 🔥 슬라이드 */}
      <div className="flex-1 overflow-hidden">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4800 }}
          loop={true}
          slidesPerView={1}
          className="h-[50px] flex items-center"
        >
          {matches.map((m) => (
            <SwiperSlide key={m.id}>
              <div className="flex items-center justify-center gap-4 h-full">

                {/* Home */}
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={m.homeTeamLogo || "/placeholder.png"}
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="text-[12px] font-medium truncate max-w-[80px]">
                    {m.homeTeam}
                  </span>
                </div>

                <span className="text-[10px] font-bold opacity-40">vs</span>

                {/* Away */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] font-medium truncate max-w-[80px] text-right">
                    {m.awayTeam}
                  </span>
                  <img
                    src={m.awayTeamLogo || "/placeholder.png"}
                    className="w-7 h-7 rounded-full"
                  />
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
