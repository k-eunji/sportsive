// src/components/EditableField.tsx

"use client";

import { useState } from "react";

interface EditableFieldProps {
  label?: string;
  value?: string;
  onSave: (newValue: string) => Promise<void>;
  isEditable?: boolean;
  placeholder?: string;
  rows?: number;
}

export default function EditableField({
  label,
  value = "",
  onSave,
  isEditable = false,
  placeholder = "Write something...",
  rows = 3,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(text);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  return (
    <section className="mt-3 text-sm text-foreground">
      {label && <strong className="mb-1 block font-medium">{label}</strong>}

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="
              w-full rounded-md border border-border bg-background
              p-2 text-sm text-foreground
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              transition-all
            "
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              aria-label="Save changes"
              className="
                rounded-full bg-primary px-4 py-1.5 text-sm font-medium
                text-primary-foreground transition-all
                hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setEditing(false);
                setText(value);
              }}
              aria-label="Cancel editing"
              className="
                rounded-full border border-border px-4 py-1.5 text-sm font-medium
                text-muted-foreground hover:bg-muted/40 transition-all
              "
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <span className="font-medium">
            {value ? (
              value
            ) : (
              <span className="italic text-muted-foreground">
                No details yet.
              </span>
            )}
          </span>
          {isEditable && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit field"
              className="
                ml-2 text-xs font-medium text-primary underline underline-offset-2
                hover:text-primary/80 transition-colors
              "
            >
              Edit
            </button>
          )}
        </div>
      )}
    </section>
  );
}
