import Image from "next/image";
import { cn } from "@/lib/utils";

type BoutiqueImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  imageStyle?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

export function BoutiqueImage({
  src,
  alt,
  className,
  imageClassName,
  imageStyle,
  priority = false,
  sizes = "100vw",
  quality = 86
}: BoutiqueImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-mist", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
        quality={quality}
        style={imageStyle}
        className={cn("object-cover object-center", imageClassName)}
      />
    </div>
  );
}
