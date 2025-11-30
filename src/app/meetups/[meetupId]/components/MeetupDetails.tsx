// src/app/meetups/[meetupId]/components/MeetupDetails.tsx
"use client";

interface MeetupDetailsProps {
  meetupInfo: {
    venue: string;
    date: string;
    description?: string;
    features?: string[]; // 모임 특징
  };
}

export default function MeetupDetails({ meetupInfo }: MeetupDetailsProps) {
  const formattedDate = new Date(meetupInfo.date).toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <section className="bg-background border border-border rounded-2xl shadow-sm p-6 space-y-5 transition-colors">
      <h2 className="text-xl font-semibold text-foreground">
        ℹ️ About this Meetup
      </h2>

      {/* 설명 */}
      {meetupInfo.description ? (
        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
          {meetupInfo.description}
        </p>
      ) : (
        <p className="text-muted-foreground italic">
          No description provided.
        </p>
      )}

      {/* 장소 및 날짜 */}
      <div className="space-y-1 text-sm text-foreground">
        <p>
          <span className="font-semibold">📍 Venue:</span>{" "}
          {meetupInfo.venue || "TBA"}
        </p>
        <p>
          <span className="font-semibold">🕒 Date:</span> {formattedDate}
        </p>
      </div>

      {/* 주요 특징 */}
      {meetupInfo.features && meetupInfo.features.length > 0 && (
        <div className="pt-3 space-y-2">
          <h3 className="font-semibold text-foreground">⭐ Meetup Highlights:</h3>
          <ul className="list-disc list-inside text-muted-foreground">
            {meetupInfo.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
