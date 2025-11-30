//src/app/fanhub/components/item/HighlightHashtags.tsx

"use client";

export default function HighlightHashtags({ text }: { text: string }) {
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);

  return (
    <span className="flex flex-wrap gap-x-2 gap-y-1">
      {parts.map((part, i) =>
        part.startsWith("#") ? (
          <span
            key={i}
            className="
              text-blue-600 font-medium 
              hover:underline cursor-pointer
            "
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
