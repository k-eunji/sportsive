// src/app/meetups/[meetupId]/components/MeetupInfoCard/EditableRow.tsx

export default function EditableRow({
  label,
  value,
  setValue,
  editMode,
  format,
}: {
  label: string;
  value?: string | number;
  setValue: (v: any) => void;
  editMode: boolean;
  format?: (v: any) => string;
}) {
  return (
    <div className="py-3 flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>

      {editMode ? (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          className="border border-border rounded-md px-2 py-1 text-sm w-32 text-right bg-background text-foreground"
        />
      ) : (
        <span className="text-sm font-medium">{format ? format(value) : value || "—"}</span>
      )}
    </div>
  );
}
