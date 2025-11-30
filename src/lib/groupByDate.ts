//src/lib/groupByDate.ts

export function groupByDate(rooms: any[]) {
  const groups: Record<string, any[]> = {};

  rooms.forEach((room) => {
    const date = new Date(room.datetime).toISOString().split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(room);
  });

  return groups;
}
