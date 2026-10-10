/**
 * Shared responsive breakpoints. Keep in sync with the media queries in
 * `src/styles/*`. Used by JS when a component must branch on viewport
 * (e.g. side rail vs. mobile bottom sheet).
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1240,
} as const

export const MEDIA = {
  mobile: `(max-width: ${BREAKPOINTS.mobile - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.tablet}px)`,
} as const
