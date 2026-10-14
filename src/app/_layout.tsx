import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from '@/game/GameContext';
import { colors } from '@/theme';
import { AudioProvider } from '@/audio/AudioProvider';

export default function RootLayout() {
  return (
    <GameProvider><AudioProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade' }} />
    </AudioProvider></GameProvider>
  );
}
