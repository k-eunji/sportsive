//src/app/meetups/components/card/utils.ts

export const getDDay = (eventDateStr: string, deadlineStr?: string) => {
  const now = new Date();
  const eventDate = new Date(eventDateStr);
  const deadline = deadlineStr ? new Date(deadlineStr) : null;

  const targetDate = deadline ?? eventDate;
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursSinceEvent = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);

  if (hoursSinceEvent >= 12) return "Expired";
  if (hoursSinceEvent >= 0) return "Closed";
  if (diffDays < 1 && diffMs > 0) return "D-Day";

  return `D-${diffDays}`;
};

export const ddayColor = (label: string) => {
  switch (label) {
    case "Expired":
      return "bg-gray-300 text-gray-600";
    case "Closed":
      return "bg-gray-400 text-white";
    case "D-Day":
      return "bg-green-600 text-white";
    default:
      return "bg-red-600 text-white";
  }
};
