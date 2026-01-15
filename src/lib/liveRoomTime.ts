//src/lib/liveRoomTime.ts

function getEventDay(dateStr: string) {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getLiveRoomWindow(room: {
  datetime: string;
}) {
  // 🔑 모든 종목: 경기 당일 하루
  const day = getEventDay(room.datetime);

  const openTime = new Date(day);
  openTime.setHours(0, 0, 0, 0);

  const closeTime = new Date(day);
  closeTime.setHours(23, 59, 59, 999);

  return { openTime, closeTime };
}

export function isLiveNow(room: {
  datetime: string;
}) {
  const now = new Date();
  const { openTime, closeTime } = getLiveRoomWindow(room);
  return now >= openTime && now <= closeTime;
}
