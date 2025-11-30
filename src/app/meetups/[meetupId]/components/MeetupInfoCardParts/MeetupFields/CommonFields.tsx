// src/app/meetups/[meetupId]/components/MeetupInfoCard/MeetupFields/CommonFields.tsx

"use client";

import InfoRow from "../InfoRow";
import EditableRow from "../EditableRow";
import formatType from "../formatType";

export default function CommonFields({
  meetup,
  fee,
  setFee,
  ageLimit,
  setAgeLimit,
  ageFrom,
  setAgeFrom,
  ageTo,
  setAgeTo,
  editMode,
}: any) {
  const formattedDate = new Date(meetup.datetime).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const regDeadline = meetup.applicationDeadline
    ? new Date(meetup.applicationDeadline).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No registration deadline";

  return (
    <div className="divide-y divide-border">

      <InfoRow label="Type" value={formatType(meetup.type)} />

      <InfoRow
        label="Location"
        value={
          meetup.location?.name ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${meetup.location.lat},${meetup.location.lng}`}
              className="text-primary hover:underline truncate"
              target="_blank"
              rel="noopener noreferrer"
            >
              {meetup.location.name}
            </a>
          ) : (
            "TBA"
          )
        }
      />

      <InfoRow label="Date" value={formattedDate} />

      <InfoRow
        label="Registration closes"
        value={<span className="text-red-500">{regDeadline}</span>}
      />

      {/* Fee */}
      <EditableRow
        label="Fee"
        value={fee}
        setValue={setFee}
        editMode={editMode}
        format={(v) =>
          !v || v === "0"
            ? "Free"
            : v.toString().startsWith("£")
            ? v
            : `£${v}`
        }
      />

      {/* Age Limit */}
      <InfoRow
        label="Age Limit"
        value={
          editMode ? (
            <select
              className="border border-border rounded-md px-2 py-1 text-sm w-36 bg-background"
              value={ageLimit}
              onChange={(e) => setAgeLimit(e.target.value)}
            >
              <option value="All ages">All ages</option>
              <option value="Under 18">Under 18</option>
              <option value="18+">18+ (includes 18)</option>
              <option value="Custom">Custom</option>
            </select>
          ) : ageLimit === "Custom" && ageFrom && ageTo ? (
            `${ageFrom}–${ageTo}`
          ) : (
            ageLimit
          )
        }
      />

      {/* Custom Age Range */}
      {editMode && ageLimit === "Custom" && (
        <div className="py-3 flex justify-end gap-3">
          <input
            type="number"
            placeholder="From"
            className="border border-border rounded-md px-2 py-1 w-20 text-sm text-right"
            value={ageFrom}
            onChange={(e) => setAgeFrom(e.target.value)}
          />
          <input
            type="number"
            placeholder="To"
            className="border border-border rounded-md px-2 py-1 w-20 text-sm text-right"
            value={ageTo}
            onChange={(e) => setAgeTo(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
