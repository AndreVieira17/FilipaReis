import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlaceholderImage({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("placeholder-media", className)}>
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
        {label && <span className="text-xs">{label}</span>}
      </div>
    </div>
  );
}
