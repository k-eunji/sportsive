//src/app/components/list/DaySection.tsx

export default function DaySection({ label }: { label: string }) {
  return (
    <div className="mt-6 mb-2">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </h2>
    </div>
  );
}
