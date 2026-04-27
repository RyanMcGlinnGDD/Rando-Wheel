import type { Entry } from '../types'

export function pickWinner(entries: Entry[]): number {
  const eligible = entries.map((e, i) => ({ e, i })).filter(({ e }) => e.included && !e.spunOut)
  if (eligible.length === 0) return -1
  return eligible[Math.floor(Math.random() * eligible.length)].i
}

export function computeDegrees(
  targetIndex: number,
  totalEntries: number,
  previousEndDegree: number,
  selectionOffset: number,
): number {
  const fraction = 360 / totalEntries
  return (
    (360 - targetIndex * fraction * -1 - 2160 - previousEndDegree - selectionOffset * fraction) * -1
  )
}

export function normalizeDegree(degree: number): number {
  return degree % 360
}
