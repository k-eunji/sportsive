//src/app/components/list/TimetableRow.tsx

"use client";

export type TimetableStatus = "LIVE" | "SOON" | "UPCOMING";

export default function TimetableRow({
  time,
  title,
  meta,
  status,
  onClick,
}: {
  time: string;
  title: string;
  meta: string;
  status: TimetableStatus;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        text-left
        px-2 py-3
        flex gap-4
        hover:bg-muted/40
        transition
      "
    >
      {/* TIME */}
      <div className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">
        {time}
      </div>

      {/* MAIN */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{meta}</p>
      </div>

      {/* STATUS */}
      <div
        className={[
          "text-xs font-semibold",
          status === "LIVE"
            ? "text-red-600"
            : status === "SOON"
            ? "text-amber-600"
            : "text-muted-foreground",
        ].join(" ")}
      >
        {status}
      </div>
    </button>
  );
}
