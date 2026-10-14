/** In-app audio switches govern game sound, independently of the phone's ringer. */
export const gameAudioMode = {
  allowsRecording: false, allowsBackgroundRecording: false,
  shouldPlayInBackground: false, playsInSilentMode: true,
  interruptionMode: 'doNotMix' as const, shouldRouteThroughEarpiece: false,
};

/** Native loading can outlive a route change, mute, or background transition. */
export function createPlaybackRequest() {
  let requested = false;
  let started = false;
  return {
    request() { requested = true; },
    cancel() { requested = false; started = false; },
    ready(isLoaded: boolean, start: () => void) {
      if (!requested || started || !isLoaded) return;
      start(); started = true;
    },
  };
}
