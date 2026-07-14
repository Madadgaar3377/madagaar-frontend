"use client";

import Image from "next/image";

/**
 * Drop-in replacement for <img> with Next.js image optimization (WebP/AVIF, responsive sizes).
 * Preserves existing className styling  no visual change.
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  loading,
  className = "",
  sizes = "100vw",
  quality,
  ...props
}) {
  return (
    <Image
      src={src}
      alt={alt || ""}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : loading || "lazy"}
      className={className}
      sizes={sizes}
      quality={quality ?? (priority ? 82 : 75)}
      {...props}
    />
  );
}
