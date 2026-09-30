/**
 * Registry of static image assets served from /public/assets.
 * Structure: /assets/{brand,home,menu,bowl-builder/...}. Stage 4 adds bowl-builder layers.
 * status:
 *  - approved: production-approved photography/artwork
 *  - reference-placeholder: generated/brand reference image; must be replaced before launch
 */
export type AssetStatus = 'approved' | 'reference-placeholder'

export interface ImageAsset {
  src: string
  alt: string
  width: number
  height: number
  status: AssetStatus
  note?: string
}

export const assets = {
  homeHeroBowl: {
    src: '/assets/home/hero-bowl.webp',
    alt: 'Overhead view of a black bowl of brown rice congee topped with pepper-crusted chicken, curry leaves and crispy shallots',
    width: 960,
    height: 886,
    status: 'reference-placeholder',
    note: 'Cropped from AI-generated brand reference (Claude project, 2026-09-27). Replace with approved photography.',
  },
} as const satisfies Record<string, ImageAsset>
