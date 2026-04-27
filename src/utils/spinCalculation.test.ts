import { describe, it, expect, vi, afterEach } from 'vitest'
import { pickWinner, computeDegrees, normalizeDegree } from './spinCalculation'
import type { Entry } from '../types'

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: crypto.randomUUID(),
  name: 'Test',
  included: true,
  spunOut: false,
  ...overrides,
})

afterEach(() => vi.restoreAllMocks())

describe('pickWinner', () => {
  it('returns -1 when no entries are eligible', () => {
    const entries = [
      makeEntry({ included: false }),
      makeEntry({ included: true, spunOut: true }),
    ]
    expect(pickWinner(entries)).toBe(-1)
  })

  it('returns the index of the first eligible entry when random=0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [
      makeEntry({ included: false }),
      makeEntry({ included: true, spunOut: false }),
      makeEntry({ included: true, spunOut: false }),
    ]
    // eligible = [index 1, index 2]; Math.floor(0 * 2) = 0 → index 1
    expect(pickWinner(entries)).toBe(1)
  })

  it('skips spunOut entries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [
      makeEntry({ included: true, spunOut: true }),
      makeEntry({ included: true, spunOut: false }),
    ]
    expect(pickWinner(entries)).toBe(1)
  })

  it('skips manually excluded entries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const entries = [
      makeEntry({ included: false }),
      makeEntry({ included: true, spunOut: false }),
    ]
    expect(pickWinner(entries)).toBe(1)
  })
})

describe('computeDegrees', () => {
  it('computes correctly for the first spin (all zeros)', () => {
    // fraction = 360/4 = 90
    // (360 - 0*90*-1 - 2160 - 0 - 0*90) * -1 = (360 - 2160) * -1 = 1800
    expect(computeDegrees(0, 4, 0, 0)).toBe(1800)
  })

  it('offsets for a non-zero target index', () => {
    // (360 - 1*90*-1 - 2160 - 0 - 0*90) * -1 = (360 + 90 - 2160) * -1 = 1710
    expect(computeDegrees(1, 4, 0, 0)).toBe(1710)
  })
})

describe('normalizeDegree', () => {
  it('returns degree mod 360', () => {
    expect(normalizeDegree(1800)).toBe(0)   // 5 * 360 = 1800
    expect(normalizeDegree(1710)).toBe(270) // 4 * 360 = 1440, 1710 - 1440 = 270
    expect(normalizeDegree(90)).toBe(90)
  })
})
