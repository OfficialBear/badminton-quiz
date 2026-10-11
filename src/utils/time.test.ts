import { describe, expect, it } from 'vitest'
import { computeRemainingSeconds } from '@/utils/time'

describe('computeRemainingSeconds', () => {
  it('returns null when there is no deadline', () => {
    expect(computeRemainingSeconds(null, 1000)).toBeNull()
  })

  it('returns a positive countdown for a future deadline (timer restore)', () => {
    const now = 1_000_000
    const deadline = new Date(now + 90_000).toISOString()
    expect(computeRemainingSeconds(deadline, now)).toBe(90)
  })

  it('clamps to zero once the deadline has passed', () => {
    const now = 1_000_000
    const deadline = new Date(now - 5_000).toISOString()
    expect(computeRemainingSeconds(deadline, now)).toBe(0)
  })

  it('returns null for an invalid deadline string', () => {
    expect(computeRemainingSeconds('not-a-date', 1000)).toBeNull()
  })
})
