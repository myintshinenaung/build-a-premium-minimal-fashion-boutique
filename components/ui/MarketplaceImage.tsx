import Image from "next/image";
import { cn } from "@/lib/utils";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTInJyBoZWlnaHQ9JzEyJyB2aWV3Qm94PScwIDAgMTIgMTInJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxMicgaGVpZ2h0PScxMicgZmlsbD0nI2Y1ZjVmNSIvPjwvc3ZnPg==";

type MarketplaceImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  imageStyle?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

export function MarketplaceImage({
  src,
  alt,
  className,
  imageClassName,
  imageStyle,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 86
}: MarketplaceImageProps) {
  const resolvedSrc = src.trim() || "/images/hero-boutique.png";
  const usesAbsoluteFill = /\babsolute\b/.test(className ?? "");

  return (
    <div className={cn("overflow-hidden bg-mist", usesAbsoluteFill ? null : "relative", className)}>
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
        quality={quality}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        style={imageStyle}
        className={cn("object-cover object-center", imageClassName)}
      />
    </div>
  );
}
