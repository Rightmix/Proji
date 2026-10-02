import type { SVGProps } from 'react'

const paths = {
  'arrow-left': 'M15 18l-6-6 6-6',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  share: 'M12 4v11M8 8l4-4 4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5',
  home: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10',
  build:
    'M4 20l10-10M13 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1zM18 11l.7-1.3L20 9l-1.3-.7L18 7l-.7 1.3L16 9l1.3.7z',
  cart: 'M3 4h2l2.4 11h10.2L20 7H6.2M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  chat: 'M4 5h16v11H9l-5 4V5zM8 9h8M8 12h5',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  pin: 'M12 21s-6-6.2-6-11a6 6 0 0112 0c0 4.8-6 11-6 11zM12 12a2 2 0 100-4 2 2 0 000 4z',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  truck:
    'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',
  store: 'M4 9l1-5h14l1 5M4 9h16M5 9v11h14V9M10 20v-6h4v6',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4V8zM4 8l8 4 8-4M12 12v8',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4',
  flame:
    'M12 21c4 0 7-2.8 7-7 0-3-2-5.5-4-7 0 2.5-1.5 4-3 4 0-3-1.5-5.5-4-7 .5 3-3 5.5-3 10 0 4.2 3 7 7 7z',
  utensils: 'M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 1-3 3.5-3 7h3v11',
  gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h0',
  repeat: 'M17 2l3 3-3 3M4 11V9a4 4 0 014-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 01-4 4H4',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
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
