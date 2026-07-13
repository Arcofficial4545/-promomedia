import Image from "next/image";

/**
 * Horizontal scroll-snap row of product imagery (Section 7.7) in flat,
 * device-neutral frames. Renders nothing when there are no images.
 */
export function ScreenshotsStrip({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  if (images.length === 0) return null;

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {images.map((src, i) => (
        <figure
          key={`${src}-${i}`}
          className="relative aspect-[16/10] w-[85%] shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] border border-line bg-white sm:w-[60%] lg:w-[48%]"
        >
          <Image
            src={src}
            alt={`${alt} — image ${i + 1}`}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 48vw"
            className="object-cover"
            unoptimized={/\.svg$/i.test(src)}
          />
        </figure>
      ))}
    </div>
  );
}
