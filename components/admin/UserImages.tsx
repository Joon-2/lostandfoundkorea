export default function UserImages({ images }: { images: any }) {
  const list: string[] = Array.isArray(images) ? images : [];
  if (list.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Customer Photos
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {list.map((src, i) => (
          <a
            key={src + i}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-square overflow-hidden rounded-lg border border-border bg-alt"
          >
            <img
              src={src}
              alt={`User photo ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
