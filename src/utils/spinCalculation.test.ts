import { describe, it, expect, vi, afterEach } from 'vitest'
import { pickWinner } from './spinCalculation'
import type { Entry } from '../types'

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: crypto.randomUUID(),
  name: 'Test',
  included: true,
  ...overrides,
})

afterEach(() => vi.restoreAllMocks())

describe('pickWinner', () => {
  it('returns -1 when no entries are eligible', () => {
    const entries = [makeEntry({ included: false }), makeEntry({ included: false })]
    expect(pickWinner(entries)).toBe(-1)
  })

  it('returns the index of the first eligible entry when random=0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [
      makeEntry({ included: false }),
      makeEntry({ included: true }),
      makeEntry({ included: true }),
    ]
    // eligible = [index 1, index 2]; Math.floor(0 * 2) = 0 → index 1
    expect(pickWinner(entries)).toBe(1)
  })

  it('skips manually excluded entries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [makeEntry({ included: false }), makeEntry({ included: true })]
    expect(pickWinner(entries)).toBe(1)
  })
})

