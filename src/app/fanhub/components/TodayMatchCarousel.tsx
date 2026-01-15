// src/app/fanhub/components/TodayMatchCarousel.tsx

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export type CarouselItem =
  | {
      id: string;
      type: "match";
      homeTeam: string;
      awayTeam: string;
      homeTeamLogo: string | null;
      awayTeamLogo: string | null;
      date: string;
    }
  | {
      id: string;
      type: "session";
      title: string;
      startDate: string;
      endDate: string;
      venue?: string;
    };

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);

  const sameMonth = s.getMonth() === e.getMonth();

  const startText = s.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const endText = e.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return sameMonth
    ? `${startText} – ${e.getDate()}, ${e.getFullYear()}`
    : `${startText} – ${endText}`;
}

export default function TodayMatchCarousel({
  items,
  label,
}: {
  items: CarouselItem[];
  label: string;
}) {
  return (
    <div className="w-full h-[50px] flex items-center px-3 mb-1">
      {/* LABEL */}
      <div className="shrink-0 text-[12px] font-semibold opacity-80 pr-3">
        {label}
      </div>

      {/* SLIDER */}
      <div className="flex-1 overflow-hidden">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4800 }}
          loop
          slidesPerView={1}
          className="h-[50px]"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              {item.type === "match" ? (
                /* ⚽️ MATCH */
                <div className="flex items-center justify-center gap-4 h-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={item.homeTeamLogo || "/placeholder.png"}
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-[12px] font-medium truncate max-w-[80px]">
                      {item.homeTeam}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold opacity-40">vs</span>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[12px] font-medium truncate max-w-[80px] text-right">
                      {item.awayTeam}
                    </span>
                    <img
                      src={item.awayTeamLogo || "/placeholder.png"}
                      className="w-7 h-7 rounded-full"
                    />
                  </div>
                </div>
              ) : (
                /* 🎾 SESSION */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-[12px] font-semibold truncate max-w-[220px]">
                    🎾 {item.title}
                  </span>

                  <span className="text-[10px] opacity-70 truncate max-w-[220px]">
                    {formatDateRange(item.startDate, item.endDate)}
                    {item.venue && item.venue.length < 22
                      ? ` · ${item.venue}`
                      : ""}
                  </span>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
