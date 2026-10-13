import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { shouldShowSkeleton, SKELETON_REVEAL_MS } from '@/game/hydration';
import { colors } from '@/theme';

export function SkeletonRectangle({ width = '100%', height = 18, round = false }: { width?: DimensionValue; height?: number; round?: boolean }) {
  return <View style={[styles.shape, { width, height, borderRadius: round ? height / 2 : 8 }]} />;
}

export function SkeletonProfileCard() {
  return <View style={styles.card}>
    <View style={styles.row}><SkeletonRectangle width={72} height={72} round /><View style={styles.copy}><SkeletonRectangle width="75%" height={22} /><SkeletonRectangle width="48%" height={13} /></View></View>
    <SkeletonRectangle height={10} />
  </View>;
}

export function SkeletonStatisticsCard() {
  return <View style={styles.card}><SkeletonRectangle width="50%" height={15} /><View style={styles.row}>
    {[0, 1, 2].map((item) => <View key={item} style={styles.copy}><SkeletonRectangle width="70%" height={30} /><SkeletonRectangle height={12} /></View>)}
  </View></View>;
}

export function HydrationPlaceholder({ pending, compact = false, label = 'Loading your adventure…' }: { pending: boolean; compact?: boolean; label?: string }) {
  return pending ? <PendingSkeleton compact={compact} label={label} /> : null;
}

function PendingSkeleton({ compact, label }: { compact: boolean; label: string }) {
  const [elapsed, setElapsed] = useState(0);
  const [pulse] = useState(() => new Animated.Value(1));
  const reducedMotion = useReducedMotion();
  const visible = shouldShowSkeleton(true, elapsed);
  useEffect(() => {
    const timer = setTimeout(() => setElapsed(SKELETON_REVEAL_MS), SKELETON_REVEAL_MS);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!visible || reducedMotion) { pulse.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.55, duration: 950, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 950, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [visible, reducedMotion, pulse]);
  return <View style={[styles.loading, compact && styles.compact]} accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy: true }}>
    <Text style={styles.label}>{label}</Text>
    {visible ? <Animated.View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ opacity: pulse }}>
      <SkeletonProfileCard />
      {!compact ? <><SkeletonStatisticsCard /><View style={styles.card}><SkeletonRectangle height={48} /><SkeletonRectangle height={48} /></View></> : null}
    </Animated.View> : null}
  </View>;
}

const styles = StyleSheet.create({
  loading: { width: '100%', maxWidth: 500, alignSelf: 'center', padding: 16, minHeight: 450 },
  compact: { padding: 0, minHeight: 145 },
  label: { color: colors.muted, fontSize: 13, marginBottom: 16 },
  shape: { backgroundColor: '#45405F' },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, gap: 18, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  copy: { flex: 1, gap: 12 },
});
