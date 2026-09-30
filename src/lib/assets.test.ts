import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { assets } from './assets'

describe('C-06 asset registry', () => {
  it.each(Object.entries(assets))('%s is complete and present', (_k, a) => {
    expect(a.alt.length).toBeGreaterThan(10)
    expect(a.width).toBeGreaterThan(0)
    expect(a.height).toBeGreaterThan(0)
    expect(['approved', 'reference-placeholder']).toContain(a.status)
    expect(a.src.startsWith('/assets/')).toBe(true)
    expect(existsSync(resolve(__dirname, '../../public', a.src.slice(1)))).toBe(true)
  })
})
