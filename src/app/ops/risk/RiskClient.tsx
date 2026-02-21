//src/app/ops/risk/RiskClient.tsx

"use client";

import { useMemo, useState, useEffect } from "react";
import AnchorSetupSheet from "@/app/ops/anchor/AnchorSetupSheet";
import { getRiskBand, 
  getStaffMultiplier, 
  RISK_MODEL, 
  getRiskDrivers,
  getRecommendedActions,
  getImpactRange,
} from "@/lib/risk/config";
import { computeFullRiskForDate } from "@/lib/risk/computeFullRisk";
import HomeEventMap from "@/app/ops/components/map-hero/HomeEventMap";
import { useRef } from "react";
import { haversineKm } from "@/app/ops/components/home/useUserLocation";

type Props = {
  events: any[];
  targetDate: string;
};

export default function RiskClient({
  events,
  targetDate,
}: Props) {

  /* =========================
     STATE
  ========================= */

  const [mode, setMode] =
    useState<"event" | "venue">("event");

  const [bounds, setBounds] =
    useState<google.maps.LatLngBoundsLiteral | null>(null);

  const [anchor, setAnchor] = useState<{
    label: string;
    location: { lat: number; lng: number };
  } | null>(null);

  const hasAnchor = !!anchor;

  const clearAnchor = () => setAnchor(null);

  const [showAnchorSheet, setShowAnchorSheet] = useState(false);

  const mapRef = useRef<any>(null);

  const [activeDate, setActiveDate] = useState(targetDate);

  const formattedScenarioDate = useMemo(() => {
    const d = new Date(activeDate);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [activeDate]);

  const eventsForActiveDate = useMemo(() => {
    const target = new Date(activeDate);
    target.setHours(0,0,0,0);

    return events.filter(e => {
      const raw = e.date ?? e.startDate ?? e.utcDate;
      if (!raw) return false;

      const d = new Date(raw);
      d.setHours(0,0,0,0);

      return d.getTime() === target.getTime();
    });
  }, [events, activeDate]);

  const eventsWithDistance = useMemo(() => {
    if (!anchor?.location) return eventsForActiveDate;

    return eventsForActiveDate.map((e) => {
      if (!e.location) return e;

      const km = haversineKm(anchor.location, e.location);
      const miles = km * 0.621371;

      return {
        ...e,
        __distanceMiles: miles,
      };
    });
  }, [eventsForActiveDate, anchor]); 
  /* =========================
     CORE RISK (SERVER-BASED)
  ========================= */
    const boundedEvents = useMemo(() => {
      const base = eventsForActiveDate;

      if (!bounds) return base;

      return base.filter(e => {
        if (!e.location) return false;

        return (
          e.location.lat <= bounds.north &&
          e.location.lat >= bounds.south &&
          e.location.lng <= bounds.east &&
          e.location.lng >= bounds.west
        );
      });
    }, [eventsForActiveDate, bounds]);

  const risk = useMemo(() => {
    return computeFullRiskForDate({
      events: boundedEvents,
      targetDate: activeDate,
      anchorLocation: anchor?.location ?? null
    });
  }, [boundedEvents, activeDate, anchor]);

  const peakConcurrent = risk.peakConcurrent;
  const percentile = risk.percentile;
  const spatialOverlap = risk.spatialOverlap;
  const timeOverlap = risk.timeOverlap;
  const finalScore = risk.finalScore;

  /* =========================
     ALTERNATIVE DATES (REAL DATA)
  ========================= */

  const alternativeScores = useMemo(() => {

    const today = new Date();
    today.setHours(0,0,0,0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + RISK_MODEL.DECISION_WINDOW_DAYS);

    const uniqueDates = Array.from(
      new Set(
        events.map(e =>
          (e.date ?? e.startDate ?? e.utcDate)?.slice(0,10)
        )
      )
    ).filter(Boolean);

    return uniqueDates
      .filter(date => {
        if (date === targetDate) return false;

        const d = new Date(date);
        return d >= today && d <= maxDate;
      })
      .map(date => {
        const altRisk = computeFullRiskForDate({
          events,
          targetDate: date,
          anchorLocation: anchor?.location ?? null
        });

        return {
          label: date,
          score: altRisk.finalScore,
          delta: altRisk.finalScore - finalScore
        };
      })

      .sort((a,b)=>a.score - b.score);

  }, [events, targetDate, anchor, finalScore]);

  const band = getRiskBand(finalScore);

  const currentRank = useMemo(() => {
    const scores = alternativeScores.map(d => d.score);
    const better = scores.filter(s => s < finalScore).length;
    return better + 1;
  }, [alternativeScores, finalScore]);

  /* =========================
     FINANCIAL MODE
  ========================= */

  const [capacity, setCapacity] = useState(20000);
  const [expected, setExpected] = useState(16000);
  const [ticket, setTicket] = useState(35);

  const occupancyRate =
    capacity > 0
      ? Math.round((expected / capacity) * 100)
      : 0;

  const revenue = expected * ticket;
  const drivers = useMemo(() => getRiskDrivers(risk), [risk]);

  const [low, high] = getImpactRange(finalScore);

  const revenueLow = revenue * (1 + low/100);
    const revenueHigh = revenue * (1 + high/100);
    const actions = getRecommendedActions(finalScore);

    const decisionRecommendation = useMemo(() => {
    if (finalScore >= 80)
      return "Avoid scheduling in this window.";
    if (finalScore >= 65)
      return "High operational pressure expected. Consider shifting date.";
    if (finalScore >= 50)
      return "Moderate congestion risk. Plan buffer resources.";
    return "Operational conditions are within normal range.";
  }, [finalScore]);

  /* =========================
     VENUE MODE
  ========================= */

  const [baselineStaff, setBaselineStaff] =
    useState(120);

  const [hourlyCost, setHourlyCost] =
    useState(12);

  const [shiftHours, setShiftHours] =
    useState(5);

  const multiplier = getStaffMultiplier(finalScore);

  const adjustedStaff =
    Math.round(baselineStaff * multiplier);

  const additionalStaff =
    adjustedStaff - baselineStaff;

  const additionalCost =
    additionalStaff * hourlyCost * shiftHours;

  const potentialLoss =
    revenue - revenueHigh > 0
      ? revenue - revenueHigh
      : 0;  

  useEffect(() => {
    setActiveDate(targetDate);
  }, [targetDate]);    

  /* ========================= */

  return (
    <div className="flex h-[calc(100vh-56px)]">

      {/* ================= LEFT ================= */}
      <div className="w-[520px] border-r p-6 space-y-8 overflow-y-auto">

        <h2 className="text-xl font-semibold">
          Risk & Impact Decision Engine
        </h2>

        {/* MODE SWITCH */}
        <div className="flex gap-2">
          <button
            onClick={()=>setMode("event")}
            className={`px-3 py-1 border ${mode==="event"?"bg-black text-white":""}`}
          >
            Event Company
          </button>

          <button
            onClick={()=>setMode("venue")}
            className={`px-3 py-1 border ${mode==="venue"?"bg-black text-white":""}`}
          >
            Venue Operator
          </button>
        </div>

        {/* DECISION SUMMARY */}
        <div className="rounded-2xl p-6 bg-black text-white space-y-3">

          <p className="text-xs uppercase tracking-wide opacity-70">
            Decision Summary
          </p>

          <p className="text-xs opacity-60">
            Scenario: {formattedScenarioDate}
          </p>

          <p className="text-lg font-semibold">
            {decisionRecommendation}
          </p>

          <p className="text-sm opacity-70">
            Risk score: {finalScore} / 100 ({band})
          </p>
          <p className="text-sm opacity-80">
            This window is busier than {percentile}% of comparable dates.
          </p>
          <p className="text-sm opacity-80">
            Concurrent major events: {peakConcurrent}
          </p>

          <p className="text-sm opacity-80">
            Events visible on map: {spatialOverlap}
          </p>

          <p className="text-sm opacity-80">
            Simultaneous events (±2h): {timeOverlap}
          </p>

        </div>

        <div className="mt-4">
          {!hasAnchor ? (
            <button
              onClick={() => setShowAnchorSheet(true)}
              className="border px-3 py-2 text-sm rounded"
            >
              Select Location
            </button>
          ) : (
            <div className="flex justify-between items-center text-sm">
              <span>{anchor?.label}</span>
              <button
                onClick={clearAnchor}
                className="text-red-500"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {showAnchorSheet && (
          <AnchorSetupSheet
            areaLabel="Choose anchor location"
            onSubmit={(label, location) => {
              setAnchor({ label, location });
              setShowAnchorSheet(false);

              mapRef.current?.panTo(location);
            }}

            onClose={() => setShowAnchorSheet(false)}
          />
        )}

        {/* RISK DRIVERS */}
        <div className="border p-4 rounded-xl space-y-2 text-sm">
          <p className="font-semibold">
            Primary Risk Drivers
          </p>

          {drivers.length === 0 && (
            <p>No significant external pressure detected.</p>
          )}

          {drivers.map((d, i) => (
            <p key={i}>• {d}</p>
          ))}
        </div>


        {/* FINANCIAL MODE */}
        {mode === "event" && (
          <div className="border p-4 rounded-xl space-y-2 text-sm">
            <p className="font-semibold">
              Financial Projection
            </p>

            <input
              type="number"
              value={capacity}
              onChange={e=>setCapacity(Number(e.target.value))}
              className="border p-1 w-full"
              placeholder="Capacity"
            />

            <input
              type="number"
              value={expected}
              onChange={e=>setExpected(Number(e.target.value))}
              className="border p-1 w-full"
              placeholder="Expected Attendance"
            />

            <input
              type="number"
              value={ticket}
              onChange={e=>setTicket(Number(e.target.value))}
              className="border p-1 w-full"
              placeholder="Avg Ticket"
            />

            <p>Occupancy: {occupancyRate}%</p>
            <p>
              Projected Revenue:
              £{revenue.toLocaleString()}
            </p>
          </div>
        )}

        {/* IMPACT FORECAST */}
        {mode === "event" && (
          <div className="border p-4 rounded-xl space-y-2 text-sm">
            <p className="font-semibold">
              Impact Forecast
            </p>

            <p>
              Attendance impact range: {low}% to {high}%
            </p>

            <p>
              Revenue impact range:
              {" "}
              £{Math.round(revenueLow).toLocaleString()}
              {" – "}
              £{Math.round(revenueHigh).toLocaleString()}
            </p>

            {potentialLoss > 0 && (
              <p className="text-red-600 font-medium">
                Potential revenue exposure:
                £{Math.round(potentialLoss).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* VENUE MODE */}
        {mode==="venue" && (
          <div className="border p-4 rounded-xl space-y-3">
            <p className="font-semibold">
              Operational Projection
            </p>

            <input
              type="number"
              value={baselineStaff}
              onChange={e=>setBaselineStaff(Number(e.target.value))}
              className="border p-1 w-full"
              placeholder="Baseline Staff"
            />

            <input
              type="number"
              value={hourlyCost}
              onChange={e=>setHourlyCost(Number(e.target.value))}
              className="border p-1 w-full"
              placeholder="Hourly Cost"
            />

            <input
              type="number"
              value={shiftHours}
              onChange={e=>setShiftHours(Number(e.target.value))}
              className="border p-1 w-full"
              placeholder="Shift Hours"
            />

            <p>Recommended Staff: {adjustedStaff}</p>
            <p>Additional Staff: {additionalStaff}</p>
            <p>
              Additional Cost:
              £{additionalCost.toLocaleString()}
            </p>
            {additionalCost > 0 && (
              <p className="text-red-600 font-medium">
                Operational cost increase:
                £{additionalCost.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* OPERATIONAL ADJUSTMENT */}
        {mode === "venue" && (
          <div className="border p-4 rounded-xl space-y-2 text-sm">
            <p className="font-semibold">
              Operational Adjustment Recommended
            </p>

            {actions.map((a, i) => (
              <p key={i}>• {a}</p>
            ))}
          </div>
        )}

        {/* ALTERNATIVE DATE COMPARISON */}
        <div className="space-y-2">

          <p className="text-sm">
            Current option ranks{" "}
            <strong>{currentRank}</strong>{" "}
            out of {alternativeScores.length} evaluated dates.
          </p>

          <div className="border p-4 rounded-xl space-y-2 text-sm">

            <p>
              Current date score:
              <strong> {finalScore}</strong>
            </p>

            {alternativeScores.map((alt, i) => (
              <div key={i}
                className="flex justify-between border-b pb-1">
                <span
                  onClick={() => setActiveDate(alt.label)}
                  className="cursor-pointer hover:underline"
                >
                  {alt.label}
                </span>
                <span>
                  <strong>{alt.score}</strong>
                  {alt.delta < 0 && (
                    <span className="text-green-600 ml-2">
                      ↓ {Math.abs(alt.delta)}
                    </span>
                  )}

                  {alt.delta > 0 && (
                    <span className="text-red-600 ml-2">
                      ↑ {Math.abs(alt.delta)}
                    </span>
                  )}
                </span>
              </div>
            ))}

            {alternativeScores.length > 0 && (
              <p className="pt-2 font-medium">
                Best alternative:
                {" "}
                <strong>
                  {alternativeScores[0].label}
                </strong>
                {" "} (Score {alternativeScores[0].score})
              </p>
            )}

          </div>
        </div>
      </div>

      <div className="border p-4 rounded-xl space-y-2 text-sm">
        <p className="font-semibold">
          Events on {activeDate}
        </p>

        {eventsForActiveDate.length === 0 && (
          <p className="opacity-60">No events on this date.</p>
        )}

        {eventsWithDistance
          .filter(e => {
            if (!bounds || !e.location) return true;
            return (
              e.location.lat <= bounds.north &&
              e.location.lat >= bounds.south &&
              e.location.lng <= bounds.east &&
              e.location.lng >= bounds.west
            );
          })
          .map((e: any) => (
          <div
            key={e.id}
            className="border-b pb-2 cursor-pointer hover:bg-gray-50"
            onClick={() => mapRef.current?.focus(e.id)}
          >
            <p className="font-medium">
              {e.homeTeam ?? e.name ?? "Event"}
            </p>

            {typeof e.__distanceMiles === "number" && (
              <p className="text-xs text-gray-500">
                {e.__distanceMiles.toFixed(1)} mi away
              </p>
            )}

            <p className="text-xs opacity-70">
              {new Date(e.date ?? e.startDate ?? e.utcDate).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex-1 relative">
        <HomeEventMap
          ref={mapRef}
          events={eventsForActiveDate}
          onBoundsChanged={setBounds}
          onDiscover={(id) => {
            console.log("Discover:", id);
          }}
        />
      </div>

    </div>
  );
}
