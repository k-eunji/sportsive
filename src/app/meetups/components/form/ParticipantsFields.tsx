// src/app/meetups/components/form/ParticipantsFields.tsx

"use client";

import React, { useState } from "react";

interface ParticipantsFieldsProps {
  form: any;
  meetupType: string;
}

export default function ParticipantsFields({
  form,
  meetupType,
}: ParticipantsFieldsProps) {

  const {
    purpose,
    setPurpose,
    maxParticipants,
    setMaxParticipants,
    isPrivate,
    setIsPrivate,
    ageLimit,
    setAgeLimit,
    ageFrom,
    setAgeFrom,
    ageTo,
    setAgeTo,
    skillLevel,
    setSkillLevel,
    fee,
    setFee,
  } = form;

  const [ageOption, setAgeOption] = useState(
    ageLimit === "" ? "all" : ageLimit === "18+" ? "18plus" : "custom"
  );

  return (
    <div className="space-y-6 mt-8">
      {/* Purpose */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Purpose
        </p>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Optional"
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent placeholder-gray-400
            focus:border-black
          "
        />
      </div>

      {/* Max participants */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Max Participants
        </p>
        <input
          type="number"
          value={maxParticipants || ""}
          onChange={(e) => setMaxParticipants(+e.target.value)}
          placeholder="Optional"
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent placeholder-gray-400
            focus:border-black
          "
        />
      </div>

      {/* Age Limit */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Age Limit
        </p>

        <select
          value={ageOption}
          onChange={(e) => {
            const val = e.target.value;
            setAgeOption(val);
            if (val === "all") setAgeLimit("All ages");
            else if (val === "under18") setAgeLimit("Under 18");
            else if (val === "18plus") setAgeLimit("18+");
            else setAgeLimit("custom");
          }}
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent focus:border-black
          "
        >
          <option value="all">All ages</option>
          <option value="under18">Under 18</option>
          <option value="18plus">18+</option>
          <option value="custom">Custom Range</option>
        </select>

        {ageOption === "custom" && (
          <div className="flex gap-3 mt-3">
            <input
              type="number"
              placeholder="From"
              value={ageFrom || ""}
              onChange={(e) => setAgeFrom(+e.target.value)}
              className="
                w-1/2 border-b border-gray-300 py-2 text-[15px]
                bg-transparent focus:border-black
              "
            />
            <input
              type="number"
              placeholder="To"
              value={ageTo || ""}
              onChange={(e) => setAgeTo(+e.target.value)}
              className="
                w-1/2 border-b border-gray-300 py-2 text-[15px]
                bg-transparent focus:border-black
              "
            />
          </div>
        )}
      </div>

      {/* Skill Level */}
      {(meetupType === "pickup_sports" || meetupType === "online_game") && (
        <div>
          <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
            Skill Level
          </p>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="
              w-full border-b border-gray-300 py-2 text-[15px]
              bg-transparent focus:border-black
            "
          >
            <option value="any">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {/* Fee */}
      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Participation Fee
        </p>
        <input
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value === "" ? "" : +e.target.value)}
          placeholder="0 for free"
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent placeholder-gray-400
            focus:border-black
          "
        />
      </div>

      {/* Public / Private */}
      <div className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          checked={!isPrivate}
          onChange={() => setIsPrivate(!isPrivate)}
          className="accent-black w-4 h-4"
        />
        <span className="text-[14px] text-gray-800">Show participants publicly</span>
      </div>
    </div>
  );
}
