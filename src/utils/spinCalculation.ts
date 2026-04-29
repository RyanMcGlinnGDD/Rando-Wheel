import type { Entry } from '../types'

export function pickWinner(entries: Entry[]): number {
  const eligible = entries.map((e, i) => ({ e, i })).filter(({ e }) => e.included)
  if (eligible.length === 0) return -1
  return eligible[Math.floor(Math.random() * eligible.length)].i
}

