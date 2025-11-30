// src/app/meetups/[meetupId]/components/MeetupInfoCard/InfoRow.tsx

export default function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="py-3 flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>

      <div className="text-sm font-medium text-foreground flex items-center gap-2 max-w-[60%] justify-end">
        {value ?? "—"}
      </div>
    </div>
  );
}
