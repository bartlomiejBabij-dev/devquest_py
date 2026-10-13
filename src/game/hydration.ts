export type HydrationStatus = 'loading' | 'ready' | 'unavailable';
export const SKELETON_REVEAL_MS = 120;

export function isHydrating(...statuses: readonly string[]): boolean {
  return statuses.includes('loading');
}

/** Delay only placeholder visibility, never data or navigation readiness. */
export function shouldShowSkeleton(pending: boolean, elapsedMs: number): boolean {
  return pending && elapsedMs >= SKELETON_REVEAL_MS;
}
