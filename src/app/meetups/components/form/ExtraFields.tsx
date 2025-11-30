// src/app/meetups/components/form/ExtraFields.tsx

"use client";

import React, { useCallback } from "react";
import type { MeetupFormReturn } from "@/app/meetups/hooks/useMeetupForm";

interface ExtraFieldsProps {
  form: MeetupFormReturn; // ✔ 핵심: 타입 지정
}

export default function ExtraFields({ form }: ExtraFieldsProps) {
  const {
    datetime,
    setDatetime,
    getDatetimeLocalValue,
    details,
    setDetails,
    applicationDeadline,
    setApplicationDeadline,
    deadlineOption,
    setDeadlineOption,
    sportType,
    setSportType,
  } = form;

  const parseDateTime = useCallback((value: string) => {
    const [d, t] = value.split("T");
    const [y, m, day] = d.split("-").map(Number);
    const [h, min] = t.split(":").map(Number);
    return new Date(y, m - 1, day, h, min).toISOString();
  }, []);

  const handleDeadlineOptionChange = (
    option: "until" | "30min" | "1hour" | "1day" | "2days" | "custom"
  ) => {
    setDeadlineOption(option);

    if (!datetime) return;

    if (option === "until") {
      setApplicationDeadline(new Date(datetime).toISOString());
      return;
    }

    if (option === "custom") return;

    const base = new Date(datetime);

    const offsetMap = {
      "30min": 30 * 60 * 1000,
      "1hour": 60 * 60 * 1000,
      "1day": 24 * 60 * 60 * 1000,
      "2days": 2 * 24 * 60 * 60 * 1000,
    };

    const t = offsetMap[option]; // t는 이제 절대 undefined 아님

    const result = new Date(base.getTime() - t);
    setApplicationDeadline(result.toISOString());
  };

  return (
    <div className="space-y-8 mt-10">

      {/* Meeting Date */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Meeting Date
        </p>
        <input
          type="datetime-local"
          value={datetime ? getDatetimeLocalValue(datetime) : ""}
          onChange={(e) => setDatetime(parseDateTime(e.target.value))}
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent focus:border-black
          "
        />
      </div>

      {/* Registration Deadline */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Registration Deadline
        </p>

        <select
          value={deadlineOption}
          onChange={(e) =>
            handleDeadlineOptionChange(
              e.target.value as
                | "until"
                | "30min"
                | "1hour"
                | "1day"
                | "2days"
                | "custom"
            )
          }
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent focus:border-black
          "
        >

          <option value="until">Until meeting time</option>
          <option value="30min">30 minutes before</option>
          <option value="1hour">1 hour before</option>
          <option value="1day">1 day before</option>
          <option value="2days">2 days before</option>
          <option value="custom">Custom</option>
        </select>

        {deadlineOption === "custom" && (
          <input
            type="datetime-local"
            value={applicationDeadline?.slice(0, 16) || ""}
            onChange={(e) => setApplicationDeadline(parseDateTime(e.target.value))}
            className="
              mt-3 w-full border-b border-gray-300 py-2 text-[15px]
              bg-transparent focus:border-black
            "
          />
        )}
      </div>

      {/* Details */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Details
        </p>
        <textarea
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Optional details"
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent resize-none
            focus:border-black
          "
        />
      </div>

      {/* Sport Type */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Sport Type
        </p>
        <select
          value={sportType}
          onChange={(e) => setSportType(e.target.value)}
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent focus:border-black
          "
        >
          <option value="">Select sport</option>
          <option value="football">Football</option>
          <option value="rugby">Rugby</option>
          <option value="cricket">Cricket</option>
          <option value="tennis">Tennis</option>
          <option value="golf">Golf</option>
          <option value="f1">Formula 1</option>
          <option value="horseracing">Horse Racing</option>
          <option value="boxing">Boxing</option>
          <option value="cycling">Cycling</option>
          <option value="running">Running</option>
          <option value="snooker">Snooker</option>
          <option value="darts">Darts</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
}
