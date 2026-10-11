/** Remaining seconds until an ISO deadline, or null when there is no deadline. */
export function computeRemainingSeconds(deadlineAt: string | null, now: number): number | null {
  if (!deadlineAt) return null
  const target = new Date(deadlineAt).getTime()
  if (Number.isNaN(target)) return null
  return Math.max(0, Math.round((target - now) / 1000))
}
