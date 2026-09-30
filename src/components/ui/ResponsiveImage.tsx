import { useState, type ImgHTMLAttributes } from 'react'
import type { ImageAsset } from '../../lib/assets'
import { cn } from '../../lib/cn'

/**
 * Image with intrinsic dimensions (prevents layout shift), lazy loading by default,
 * and a neutral fallback surface if the file fails to load.
 */
export function ResponsiveImage({
  asset,
  priority,
  className,
  ...rest
}: { asset: ImageAsset; priority?: boolean } & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height'
>) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        role="img"
        aria-label={asset.alt}
        style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
        className={cn('bg-surface-muted', className)}
      />
    )
  }
  return (
    <img
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  )
}

/** Circular thumbnail frame (ingredient-card style). */
export function MediaCircle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'grid size-12 shrink-0 place-items-center overflow-hidden rounded-pill bg-surface-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}
