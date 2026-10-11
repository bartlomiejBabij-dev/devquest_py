import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameScreen } from '@/components/GameScreen';
import { SpellbookEntryView } from '@/components/SpellbookEntryView';
import { spellbookEntries } from '@/game/spellbookContent';
import { chapters } from '@/game/worldContent';
import { colors } from '@/theme';

const glyphs = ['✦', '◆', '◈', '✧', '✣', '◇', '❖', '✥', '✦'];

export default function SpellbookScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = spellbookEntries.find((entry) => entry.id === selectedId);

  function goHome() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  if (selected) {
    return <SafeAreaView style={styles.detailSafe} edges={['top', 'bottom']}>
      <SpellbookEntryView key={selected.id} entry={selected} onClose={() => setSelectedId(null)} />
    </SafeAreaView>;
  }

  return <GameScreen compact>
    <View style={styles.navRow}>
      <Pressable onPress={goHome} accessibilityRole="button" accessibilityLabel="Back to Home" style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Text style={styles.backText}>‹  HOME</Text>
      </Pressable>
      <Text style={styles.navLabel}>FOREST OF VARIABLES</Text>
    </View>

    <View style={styles.banner}>
      <View style={styles.bookSymbol}><Text style={styles.bookSymbolText}>✧</Text></View>
      <Text style={styles.bannerEyebrow}>THE PYTHON ARCHIVE</Text>
      <Text accessibilityRole="header" style={styles.bannerTitle}>Spellbook</Text>
      <Text style={styles.bannerBody}>Every great spell begins with understanding. Study the ideas behind your Python adventure.</Text>
      <Text style={styles.bannerCount}>{spellbookEntries.length} CONCEPTS TO EXPLORE</Text>
    </View>

    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>KNOWLEDGE SCROLLS</Text>
      <Text style={styles.sectionGlyph}>✦  ✧  ✦</Text>
    </View>

    {spellbookEntries.map((entry, index) => {
      const chapter = chapters.find((item) => item.id === entry.chapterId);
      return <Pressable key={entry.id} onPress={() => setSelectedId(entry.id)} accessibilityRole="button" accessibilityLabel={`Read ${entry.title}`}
        accessibilityHint={`Opens a Python lesson from ${chapter?.title ?? 'Forest of Variables'}`}
        style={({ pressed }) => [styles.entryCard, pressed && styles.pressed]}>
        <View style={styles.glyphFrame}><Text style={styles.glyph}>{glyphs[index % glyphs.length]}</Text></View>
        <View style={styles.entryCopy}>
          <Text style={styles.entryChapter}>{chapter?.title.toUpperCase() ?? 'PYTHON'}</Text>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.entrySummary} numberOfLines={2}>{entry.explanation}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>;
    })}
    <Text style={styles.footer}>✧  KNOWLEDGE IS YOUR STRONGEST SPELL  ✧</Text>
  </GameScreen>;
}

const styles = StyleSheet.create({
  detailSafe: { flex: 1, backgroundColor: colors.background },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, marginBottom: 12, gap: 8 },
  backButton: { minHeight: 44, minWidth: 72, justifyContent: 'center' },
  backText: { color: colors.muted, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  navLabel: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, flexShrink: 1 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  banner: { alignItems: 'center', backgroundColor: '#211D43', borderColor: '#6E5CA6', borderWidth: 1, borderRadius: 24, paddingHorizontal: 23, paddingTop: 22, paddingBottom: 22 },
  bookSymbol: { width: 72, height: 72, backgroundColor: '#3A315D', borderWidth: 1, borderColor: colors.gold, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  bookSymbolText: { color: colors.gold, fontSize: 46, lineHeight: 54 },
  bannerEyebrow: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 2.4 },
  bannerTitle: { color: colors.text, fontSize: 34, fontWeight: '900', lineHeight: 41, marginTop: 4 },
  bannerBody: { color: '#C8C3DE', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7 },
  bannerCount: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginTop: 18 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 26, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  sectionGlyph: { color: colors.violet, fontSize: 13, letterSpacing: 3 },
  entryCard: { minHeight: 91, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 17, paddingHorizontal: 13, paddingVertical: 13, marginBottom: 10 },
  glyphFrame: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#332B55', borderWidth: 1, borderColor: '#7668AC', alignItems: 'center', justifyContent: 'center' },
  glyph: { color: colors.gold, fontSize: 26 },
  entryCopy: { flex: 1 },
  entryChapter: { color: colors.violet, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  entryTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 3 },
  entrySummary: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  chevron: { color: colors.gold, fontSize: 28, paddingHorizontal: 2 },
  footer: { color: '#777896', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, textAlign: 'center', marginTop: 18, marginBottom: 8 },
});
