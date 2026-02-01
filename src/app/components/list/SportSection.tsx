//src/app/components/list/SportSection.tsx

export default function SportSection({ title }: { title: string }) {
  return (
    <div className="mt-4 mb-1">
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

