import Image from "next/image";
import { PlaceholderImage } from "./PlaceholderImage";
import { cn } from "@/lib/utils";

/**
 * Enquadramento consistente para qualquer imagem de produto: quadrado 1:1,
 * fundo branco, objeto centrado com object-contain — para que fotos com
 * proporções/tamanhos diferentes fiquem sempre visualmente iguais.
 */
export function ProductMedia({
  src,
  alt,
  className,
  imageClassName,
  sizes,
  priority,
  placeholderLabel,
}: {
  src: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  placeholderLabel?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-md bg-white",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
          className={cn("object-contain p-4", imageClassName)}
          priority={priority}
        />
      ) : (
        <PlaceholderImage className="h-full w-full" label={placeholderLabel} />
      )}
    </div>
  );
}
