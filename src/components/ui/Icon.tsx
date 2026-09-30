import type { SVGProps } from 'react'

const paths = {
  'arrow-left': 'M15 18l-6-6 6-6',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  share: 'M12 4v11M8 8l4-4 4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5',
} as const

export type IconName = keyof typeof paths

/** Decorative stroke icon. Pass `title` only when the icon carries meaning on its own. */
export function Icon({
  name,
  title,
  ...rest
}: { name: IconName; title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path d={paths[name]} />
    </svg>
  )
}
