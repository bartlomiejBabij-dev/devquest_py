import { useEffect } from 'react';
import {
  Easing, interpolate, interpolateColor, useAnimatedStyle, useReducedMotion,
  useSharedValue, withDelay, withSequence, withTiming,
} from 'react-native-reanimated';
import { ENEMY_MAX_HP } from '@/game/battle';
import type { BattleState } from '@/game/types';

export function useCombatAnimations(battle: BattleState) {
  const reduceMotion = useReducedMotion();
  const cast = useSharedValue(0);
  const hit = useSharedValue(0);
  const hp = useSharedValue(1);
  const hpGlow = useSharedValue(0);
  const floating = useSharedValue(0);
  const wrong = useSharedValue(0);
  const defeat = useSharedValue(0);

  useEffect(() => {
    if (battle.attemptCount === 0) {
      hp.value = battle.enemyHp / ENEMY_MAX_HP;
      return;
    }
    const ms = (duration: number) => reduceMotion ? 0 : duration;
    if (battle.result === 'incorrect') {
      wrong.value = 0;
      wrong.value = withSequence(withTiming(1, { duration: ms(100) }), withTiming(0, { duration: ms(350) }));
      return;
    }
    if (battle.result !== 'correct') return;
    cast.value = 0;
    hit.value = 0;
    floating.value = 0;
    hpGlow.value = 0;
    cast.value = withSequence(withTiming(1, { duration: ms(170) }), withTiming(0, { duration: ms(320) }));
    hit.value = withDelay(ms(130), withSequence(
      withTiming(1, { duration: ms(70) }), withTiming(-1, { duration: ms(90) }), withTiming(0, { duration: ms(100) }),
    ));
    hpGlow.value = withDelay(ms(180), withSequence(withTiming(1, { duration: ms(80) }), withTiming(0, { duration: ms(390) })));
    hp.value = withDelay(ms(230), withTiming(battle.enemyHp / ENEMY_MAX_HP, { duration: ms(400), easing: Easing.out(Easing.cubic) }));
    floating.value = withDelay(ms(130), withTiming(1, { duration: ms(650), easing: Easing.out(Easing.quad) }));
    if (battle.enemyHp === 0) defeat.value = withDelay(ms(490), withTiming(1, { duration: ms(300) }));
  }, [battle.attemptCount, battle.enemyHp, battle.result, reduceMotion, cast, hit, hp, hpGlow, floating, wrong, defeat]);

  const enemyStyle = useAnimatedStyle(() => ({ opacity: 1 - defeat.value * 0.55, transform: [{ translateX: hit.value * 10 }, { translateY: defeat.value * 15 }, { scale: 1 - Math.abs(hit.value) * 0.04 - defeat.value * 0.15 }] }));
  const castStyle = useAnimatedStyle(() => ({ opacity: cast.value * 0.85, transform: [{ scale: 0.55 + cast.value * 0.8 }] }));
  const hpStyle = useAnimatedStyle(() => ({ width: `${Math.max(0, hp.value * 100)}%` }));
  const hpGlowStyle = useAnimatedStyle(() => ({ opacity: hpGlow.value }));
  const floatingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(floating.value, [0, 0.18, 0.72, 1], [0, 1, 1, 0]),
    transform: [{ translateY: interpolate(floating.value, [0, 1], [12, -33]) }],
  }));
  const inputStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(wrong.value, [0, 1], ['#656493', '#FF9D6C']),
    backgroundColor: interpolateColor(wrong.value, [0, 1], ['#11152C', '#3D293C']),
  }));

  return { enemyStyle, castStyle, hpStyle, hpGlowStyle, floatingStyle, inputStyle };
}
