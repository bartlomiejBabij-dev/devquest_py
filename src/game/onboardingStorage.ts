export const ONBOARDING_STORAGE_KEY = 'devquest.onboarding.v1';
const COMPLETED_MARKER = 'complete';

export interface OnboardingStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export type OnboardingStatus = 'complete' | 'incomplete' | 'unavailable';

export function shouldShowOnboarding(status: OnboardingStatus, completedMissionIds: readonly string[]): boolean {
  return status === 'incomplete' && completedMissionIds.length === 0;
}

export function createOnboardingStore(storage: OnboardingStorageAdapter) {
  return {
    async load(): Promise<OnboardingStatus> {
      try {
        const value = await storage.getItem(ONBOARDING_STORAGE_KEY);
        if (value === null) return 'incomplete';
        return value === COMPLETED_MARKER ? 'complete' : 'unavailable';
      } catch {
        return 'unavailable';
      }
    },
    async complete(): Promise<boolean> {
      try {
        await storage.setItem(ONBOARDING_STORAGE_KEY, COMPLETED_MARKER);
        return true;
      } catch {
        return false;
      }
    },
  };
}
