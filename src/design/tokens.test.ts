import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { color } from './tokens'
import { contrastRatio } from './contrast'

describe('T-01 token contrast (WCAG AA)', () => {
  const text: [string, string, string, number][] = [
    ['ink on surface', color.ink, color.surface, 4.5],
    ['ink on canvas', color.ink, color.canvas, 4.5],
    ['ink-muted on surface', color['ink-muted'], color.surface, 4.5],
    ['ink-muted on canvas', color['ink-muted'], color.canvas, 4.5],
    ['ink-muted on surface-muted', color['ink-muted'], color['surface-muted'], 4.5],
    ['white on action-600', color['ink-inverse'], color['action-600'], 4.5],
    ['white on action-700 (hover)', color['ink-inverse'], color['action-700'], 4.5],
    ['select-700 on select-50', color['select-700'], color['select-50'], 4.5],
    ['select-700 on select-100', color['select-700'], color['select-100'], 4.5],
    ['white on bowl-900', color['ink-inverse'], color['bowl-900'], 4.5],
    ['danger on surface', color.danger, color.surface, 4.5],
  ]
  it.each(text)('%s', (_n, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min)
  })

  const nonText: [string, string, string][] = [
    ['focus ring on surface', color.focus, color.surface],
    ['focus ring on canvas', color.focus, color.canvas],
    ['selected border on surface', color['select-500'], color.surface],
    ['selected border on canvas', color['select-500'], color.canvas],
  ]
  it.each(nonText)('%s ≥ 3:1', (_n, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(3)
  })
})

describe('T-02 CSS theme matches TS tokens', () => {
  const css = readFileSync(resolve(__dirname, '../index.css'), 'utf8')
  it.each(Object.entries(color))('--color-%s', (name, value) => {
    const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`))
    expect(m?.[1]?.toLowerCase()).toBe(value)
  })
})
