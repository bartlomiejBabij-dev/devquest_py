import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { BackHandler, Keyboard } from 'react-native';
import { createNavigationGate } from './navigationActions';

export function useScreenNavigation() {
  const router = useRouter();
  const [gate] = useState(createNavigationGate);
  const focused = useRef(false);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    gate.reset();
    return () => { focused.current = false; };
  }, [gate]));

  function run(action: () => void) {
    return focused.current && gate.run(() => { Keyboard.dismiss(); action(); });
  }

  return {
    run,
    open: (href: Href) => run(() => router.navigate(href)),
    returnTo: (href: Href) => run(() => router.dismissTo(href)),
    reset: gate.reset,
  };
}

/** Stack screens remain mounted, so hardware Back listeners must follow focus. */
export function useScreenBack(onBack: () => void) {
  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => listener.remove();
  }, [onBack]));
}
