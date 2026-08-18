import Image from "next/image";
import { PlaceholderImage } from "./PlaceholderImage";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductMedia({
  images,
  alt,
  className,
  sizes,
  priority,
}: {
  images: ProductImage[];
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const primary = images.find((i) => i.is_primary) ?? images[0];

  if (!primary) {
    return (
      <PlaceholderImage className={cn("h-full w-full", className)} label="Fotografia em breve" />
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src={primary.url}
        alt={primary.alt_text_pt || alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}
