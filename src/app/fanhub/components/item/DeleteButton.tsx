//src/app/fanhub/components/item/DeleteButton.tsx

"use client";

export default function DeleteButton({ onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-red-500 hover:underline ml-auto block"
    >
      Delete
    </button>
  );
}
