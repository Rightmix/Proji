/** Checkout UI options. Slots are PROVISIONAL placeholders until Stage 6 defines capacity. */
export const TIME_SLOTS = ['7 AM – 9 AM', '9 AM – 11 AM', '11 AM – 1 PM', '1 PM – 3 PM'] as const

export function nextDays(from: Date, n = 4) {
  const fmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : fmt.format(d).split(' ')[0]
    return {
      key: d.toISOString().slice(0, 10),
      label,
      sub: `${d.getDate()} ${fmt.format(d).split(' ').pop()}`,
    }
  })
}
