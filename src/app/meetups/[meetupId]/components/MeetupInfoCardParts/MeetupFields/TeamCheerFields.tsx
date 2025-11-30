// src/app/meetups/[meetupId]/components/MeetupInfoCard/MeetupFields/TeamCheerFields.tsx

export default function TeamCheerFields({ meetup }: any) {
  const { teamType, event } = meetup;

  const getLogos = () => {
    if (teamType === "home") return event?.homeTeamLogo;
    if (teamType === "away") return event?.awayTeamLogo;
    if (teamType === "neutral") return null; // handled below
  };

  const label = () => {
    if (teamType === "home") return event?.homeTeam;
    if (teamType === "away") return event?.awayTeam;
    return `${event?.homeTeam} + ${event?.awayTeam}`;
  };

  return (
    <div className="py-1 flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Cheer for</span>

      <div className="flex items-center justify-end gap-1 text-sm font-medium">
        {teamType === "neutral" ? (
          <>
            <img src={event.homeTeamLogo} className="w-5 h-5 rounded-full" />
            <img src={event.awayTeamLogo} className="w-5 h-5 rounded-full" />
          </>
        ) : (
          getLogos() && <img src={getLogos()} className="w-5 h-5 rounded-full" />
        )}

        <span>{label()}</span>
      </div>
    </div>
  );
}
