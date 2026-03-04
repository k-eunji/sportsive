//src/app/sport/_components/HorseRacingNext60Density.tsx

"use client";

import { MonthDaysToggle } from "@/app/components/MonthDaysToggle";


export default function HorseRacingNext60Density({
  events
}:{events:any[]}){

  const today = new Date();
  today.setHours(0,0,0,0);

  const future = new Date();
  future.setDate(today.getDate()+60);

  const upcoming = events.filter((e:any)=>{
    const date = new Date(e.startDate);
    return (
      date>=today &&
      date<=future
    );
  });

  const total = upcoming.length;

  const grouped:Record<string,number> = {};

  upcoming.forEach((e:any)=>{
    const d = (e.startDate ?? "").slice(0,10);
    grouped[d]=(grouped[d]||0)+1;
  });

  const activeDays = Object.keys(grouped).length;

  const avgPerDay =
    activeDays>0
      ? total/activeDays
      :0;

  const sortedDays =
    Object.entries(grouped).sort(
      (a,b)=>b[1]-a[1]
    );

  const peak = sortedDays[0] ?? null;

  const densityIndex = Math.min(
    100,
    Math.round(avgPerDay*15+(peak?.[1] ?? 0)*5)
  );

  const densityLevel =
    densityIndex>70
      ?"High"
      :densityIndex>40
      ?"Moderate"
      :"Low";

  const highDensityDays = sortedDays.filter(
    ([,count])=>count>=avgPerDay+2
  );

  return(
    <section className="space-y-8">

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        <Stat title="Total Meetings" value={total}/>
        <Stat title="Active Days" value={activeDays}/>
        <Stat title="Avg / Day" value={avgPerDay.toFixed(1)}/>
        <Stat title="Peak Day" value={peak?.[1] ?? 0}/>
        <Stat title="Density Index" value={`${densityIndex}/100`}/>

      </div>

      {highDensityDays.length>0 && (
        <div className="space-y-2 text-sm">

          {highDensityDays.slice(0,6).map(([date,count])=>(
            <div key={date} className="flex justify-between border-b py-1">
              <span>{date}</span>
              <span>{count} meetings</span>
            </div>
          ))}

        </div>
      )}

      <MonthDaysToggle
        monthlyEvents={upcoming}
        totalMonth={total}
      />

    </section>
  )
}

function Stat({title,value}:any){
  return(
    <div className="border rounded-xl p-4 text-center">
      <p className="text-xs text-muted-foreground uppercase">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  )
}