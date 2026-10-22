import { ForgeScenery } from '@/components/ForgeScenery';
import { functionForge } from '@/game/forgeContent';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { ArchipelagoScenery } from '@/components/ArchipelagoScenery';
import { GameScreen } from '@/components/GameScreen';
import { NavigationButton } from '@/components/NavigationButton';
import { getBossEncounter, isBossMission, isWorldCleared } from '@/game/boss';
import { useGame } from '@/game/GameContext';
import { getChapterProgress, getTotalEarnedXp, getWorldProgress, isChapterCompleted, isChapterUnlocked, isMissionCompleted, isMissionUnlocked, isWorldUnlocked } from '@/game/progression';
import { chapters, forestOfVariables, valleyOfDecisions, loopCaverns, listArchipelago, missions, worlds } from '@/game/worldContent';
import type { Chapter, ProgressionState } from '@/game/worldTypes';
import { useScreenBack, useScreenNavigation } from '@/navigation/useScreenNavigation';
import { getAccessibleMapChapters, resolveMapWorld } from '@/navigation/worldRoutes';
import { colors } from '@/theme';

type ChapterState = 'completed' | 'available' | 'locked';

const chapterGlyphs = ['✦', '◆', '◈', '✣', '✧', '♛', '∞'];

function LockMark() {
  return <View style={styles.lockMark}><View style={styles.lockShackle} /><View style={styles.lockBody} /></View>;
}

function getChapterState(progress: ProgressionState, chapter: Chapter): ChapterState {
  if (isChapterCompleted(progress, chapter.id)) return 'completed';
  return isChapterUnlocked(progress, chapter.id) ? 'available' : 'locked';
}

function ChapterNode({ chapter, index, state, onPress, pulse }: {
  chapter: Chapter; index: number; state: ChapterState; onPress: () => void; pulse: Animated.Value;
}) {
  const boss = chapter.missionIds.map(getBossEncounter).find(Boolean);
  return (
    <View style={[styles.stopRow, index % 2 === 1 && styles.stopRowRight]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Chapter ${index + 1}: ${chapter.title}, ${state}`}
        accessibilityHint="Opens chapter details" style={({ pressed }) => [styles.chapterCard, state === 'available' && styles.chapterCardAvailable,
          chapter.worldId === loopCaverns.id && state !== 'locked' && styles.cavernCard,
          chapter.worldId === listArchipelago.id && state !== 'locked' && styles.islandCard,
          chapter.worldId === functionForge.id && state !== 'locked' && styles.forgeCard,
          state === 'completed' && styles.chapterCardCompleted, boss && styles.bossCard, boss && state === 'available' && styles.bossCardAvailable,
          boss && state === 'completed' && styles.bossCardCompleted, boss?.kind === 'loop-warden' && state !== 'locked' && styles.wardenCard, pressed && styles.pressed]}>
        <View style={[styles.glyphFrame, state === 'available' && styles.glyphFrameAvailable, state === 'completed' && styles.glyphFrameCompleted, boss && styles.bossGlyphFrame, boss && state === 'completed' && styles.bossGlyphFrameCompleted]}>
          <Text style={[styles.glyph, state === 'locked' && styles.glyphLocked]}>{boss?.kind === 'treasure-guardian' ? (state === 'completed' ? '✓' : '◇') : boss?.kind === 'loop-warden' ? '∞' : state === 'completed' ? '✓' : chapterGlyphs[index]}</Text>
        </View>
        <View style={styles.chapterCopy}>
          <View style={styles.chapterTopLine}>
            <Text style={[styles.chapterNumber, state === 'locked' && styles.lockedText]}>{boss ? 'FINAL BOSS' : `CHAPTER ${String(index + 1).padStart(2, '0')}`}</Text>
            {state === 'available' ? <Animated.Text style={[styles.availableSparkle, { opacity: pulse }]}>✦</Animated.Text> : null}
          </View>
          <Text style={[styles.chapterTitle, state === 'locked' && styles.lockedTitle]} numberOfLines={2}>{chapter.title}</Text>
          {chapter.worldId !== forestOfVariables.id ? <Text style={styles.missionDescription}>{chapter.learningObjective}</Text> : null}
          <Text style={styles.chapterMeta}>{chapter.missionIds.length} {chapter.missionIds.length === 1 ? 'MISSION' : 'MISSIONS'}  ·  {chapter.xpReward} XP</Text>
          <View style={styles.statusRow}>
            {state === 'locked' ? <LockMark /> : null}
            <Text style={[styles.statusText, state === 'available' && styles.availableText, state === 'completed' && styles.completedText]}>
              {state === 'completed' ? boss ? boss.kind === 'goblin-king' ? '♛  KING DEFEATED' : boss.kind === 'treasure-guardian' ? '◇  GUARDIAN DEFEATED' : boss.kind === 'loop-warden' ? '✓  WARDEN DEFEATED' : '✧  KEEPER DEFEATED' : '✓  COMPLETED' : state === 'available' ? boss ? boss.kind === 'goblin-king' ? '♛  FACE THE KING' : boss.kind === 'treasure-guardian' ? '◇  FACE THE GUARDIAN' : boss.kind === 'loop-warden' ? '∞  FACE THE WARDEN' : '✧  FACE THE KEEPER' : '●  AVAILABLE' : 'LOCKED'}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function ChapterDetails({ chapter, index, progress, onClose, onOpenMission }: {
  chapter: Chapter; index: number; progress: ProgressionState; onClose: () => void; onOpenMission: (missionId: string) => void;
}) {
  const state = getChapterState(progress, chapter);
  const boss = chapter.missionIds.map(getBossEncounter).find(Boolean);
  const world = resolveMapWorld(chapter.worldId);
  const completion = getChapterProgress(progress, chapter.id);
  const unmetPrerequisites = chapter.prerequisiteMissionIds.filter((id) => !isMissionCompleted(progress, id));
  const chapterMissions = chapter.missionIds.flatMap((id) => {
    const mission = missions.find((item) => item.id === id);
    return mission ? [mission] : [];
  });

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close chapter details" onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeading}>
          <NavigationButton label="Close" icon="close" accessibilityLabel="Close chapter details" onPress={onClose} />
          <Text style={styles.sheetEyebrow}>{boss ? `${boss.name.toUpperCase()} · FINAL BOSS` : `CHAPTER ${String(index + 1).padStart(2, '0')}`}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
          <Text style={styles.sheetTitle}>{chapter.title}</Text>
          <Text style={[styles.sheetStatus, state === 'available' && styles.availableText, state === 'completed' && styles.completedText]}>
            {state === 'completed' ? '✓  Completed' : state === 'available' ? '✦  Available' : '◇  Locked'}
          </Text>
          <Text style={styles.sheetDescription}>{chapter.description}</Text>

          <View style={styles.objectiveCard}>
            <Text style={styles.detailLabel}>LEARNING OBJECTIVE</Text>
            <Text style={styles.objectiveText}>{chapter.learningObjective}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statValue}>{chapter.missionIds.length}</Text><Text style={styles.statLabel}>MISSIONS</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{completion.completed}/{completion.total}</Text><Text style={styles.statLabel}>COMPLETE</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{chapter.xpReward}</Text><Text style={styles.statLabel}>XP AVAILABLE</Text></View>
          </View>
          <View style={styles.detailProgressTrack}><View style={[styles.detailProgressFill, { width: `${completion.percent}%` }]} /></View>

          {state === 'locked' ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>THE PATH IS SEALED</Text>
              {!isWorldUnlocked(progress, world.id) ? <Text style={styles.noticeText}>{world.unlockRequirement}</Text> : null}
              {unmetPrerequisites.map((id) => {
                const mission = missions.find((item) => item.id === id);
                const prerequisiteTitle = chapter.worldId === forestOfVariables.id ? mission?.title : chapters.find((item) => item.id === mission?.chapterId)?.title ?? mission?.title;
                return <Text key={id} style={styles.noticeText}>Complete “{prerequisiteTitle ?? 'the previous mission'}” to unlock this chapter.</Text>;
              })}
            </View>
          ) : (
            <View style={styles.missionsSection}>
              <Text style={styles.detailLabel}>MISSIONS</Text>
              {chapterMissions.map((mission) => (
                <View key={mission.id} style={styles.missionPreview}>
                  <View style={styles.missionPreviewTop}><Text style={styles.missionTitle}>{mission.title}</Text><Text style={styles.missionXp}>+{mission.xpReward} XP</Text></View>
                  <Text style={styles.missionDescription}>{getBossEncounter(mission.id)?.kind === 'goblin-king' ? 'Defeat the Goblin King with five Python spells. ' : ''}{mission.description}</Text>
                  {chapter.worldId !== forestOfVariables.id ? <Text style={styles.chapterMeta}>{mission.exerciseIds.length} PYTHON SPELLS</Text> : null}
                  {isMissionCompleted(progress, mission.id) ? <Text style={styles.missionComplete}>✓  COMPLETED</Text> : null}
                  {isMissionUnlocked(progress, mission.id) ? (
                    <Pressable onPress={() => onOpenMission(mission.id)} accessibilityRole="button" accessibilityLabel={`${isMissionCompleted(progress, mission.id) ? 'Replay' : 'Start'} ${mission.title}`}
                      style={({ pressed }) => [styles.missionAction, pressed && styles.pressed]}>
                      <Text style={styles.missionActionText}>{isBossMission(mission.id) ? isMissionCompleted(progress, mission.id) ? 'REPLAY BOSS' : boss?.kind === 'goblin-king' ? 'FACE GOBLIN KING' : boss?.kind === 'treasure-guardian' ? 'FACE THE GUARDIAN' : boss?.kind === 'loop-warden' ? 'FACE THE WARDEN' : 'FACE THE KEEPER' : isMissionCompleted(progress, mission.id) ? 'REPLAY MISSION' : 'START MISSION'}  ›</Text>
                    </Pressable>
                  ) : <Text style={styles.missionComplete}>LOCKED</Text>}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

export default function WorldMapScreen() {
  const navigation = useScreenNavigation();
  const router = useRouter();
  const { worldId } = useLocalSearchParams<{ worldId?: string }>();
  const world = resolveMapWorld(worldId);
  const valley = world.id === valleyOfDecisions.id;
  const caverns = world.id === loopCaverns.id;
  const archipelago = world.id === listArchipelago.id;
  const forge = world.id === functionForge.id;
  const expandedWorld = world.id !== forestOfVariables.id;
  const { progression } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(0.55));
  const worldProgress = getWorldProgress(progression, world.id);
  const worldUnlocked = isWorldUnlocked(progression, world.id);
  const chapterList = getAccessibleMapChapters(progression, world.id);
  const exerciseCount = missions.filter((mission) => world.chapterIds.includes(mission.chapterId))
    .reduce((count, mission) => count + mission.exerciseIds.length, 0);
  const selectedChapter = chapterList.find((chapter) => chapter.id === selectedId);

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.45, duration: 1200, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse, reduceMotion]);

  function goHome() { navigation.returnTo('/'); }
  useScreenBack(() => { if (selectedId) setSelectedId(null); else goHome(); });

  return (
    <>
      <GameScreen key={world.id} compact header={
        <View style={styles.navRow}>
          <NavigationButton label="Exit to Home" accessibilityLabel="Exit World Map to Home" onPress={goHome} />
          <Text style={styles.worldNumber}>WORLD {String(worlds.indexOf(world) + 1).padStart(2, '0')}  /  PYTHON</Text>
        </View>
      }>
        <View style={styles.worldPicker} accessibilityRole="tablist">
          {worlds.map((item, index) => {
            const unlocked = isWorldUnlocked(progression, item.id);
            const completed = getWorldProgress(progression, item.id).percent === 100;
            return <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: item.id === world.id }}
              accessibilityLabel={`World ${index + 1}: ${item.title}, ${completed ? 'available chapters completed' : unlocked ? 'unlocked' : 'locked'}`}
              onPress={() => { setSelectedId(null); router.setParams({ worldId: item.id }); }}
              style={({ pressed }) => [styles.worldChoice, item.id === world.id && styles.worldChoiceSelected, pressed && styles.pressed]}>
              <Text style={styles.worldChoiceLabel}>WORLD {index + 1} · {completed ? isWorldCleared(progression, item.id) ? item.id === forestOfVariables.id ? '✓ COMPLETE' : '✓ CLEARED' : '✓ UP TO DATE' : unlocked ? 'AVAILABLE' : 'LOCKED'}</Text>
              <Text style={styles.worldChoiceTitle}>{item.title}</Text>
            </Pressable>;
          })}
        </View>
        <View style={[styles.banner, valley && styles.valleyBanner, caverns && styles.cavernBanner, archipelago && styles.islandBanner, forge && styles.forgeBanner]}>
          <Text style={styles.bannerStars}>✦  ·  ✧  ·  ✦</Text>
          <Text style={styles.bannerEyebrow}>{forge ? 'DEFINE · CALL · REUSE' : archipelago ? 'GATHER · ORDER · DISCOVER' : caverns ? 'ONE SPELL · MANY ECHOES' : valley ? 'EVERY CHOICE IS A SPELL' : 'THE ADVENTURE BEGINS'}</Text>
          <Text style={[styles.bannerTitle, archipelago && styles.islandTitle]}>{forge ? 'Function' : archipelago ? 'List' : caverns ? 'Loop' : valley ? 'Valley of' : 'Forest of'}{'\n'}<Text style={[styles.bannerAccent, (caverns || archipelago) && styles.crystalText, forge && styles.forgeAccent]}>{forge ? 'Forge' : archipelago ? 'Archipelago' : caverns ? 'Caverns' : valley ? 'Decisions' : 'Variables'}</Text></Text>
          <Text style={styles.bannerDescription}>{world.description}</Text>
          {forge ? <ForgeScenery /> : archipelago ? <ArchipelagoScenery /> : caverns ? <View style={styles.crystalRow} accessible={false}>{[0, 1, 2].map(index => <Animated.View key={index} style={[styles.crystal, { opacity: pulse }]}><Text style={styles.crystalRune}>✧</Text></Animated.View>)}</View>
            : valley ? <Text style={styles.valleyPeaks} accessible={false}>◇  △  ◈  △  ◇</Text> : <View style={styles.treeLine}><Text style={styles.treeGlyph}>♠</Text><Text style={styles.treeGlyphSmall}>♠</Text><Text style={styles.treeGlyph}>♠</Text><Text style={styles.treeGlyphSmall}>♠</Text><Text style={styles.treeGlyph}>♠</Text></View>}
        </View>

        {!worldUnlocked ? <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>WORLD LOCKED</Text><Text style={styles.noticeText}>{world.unlockRequirement}</Text>
        </View> : null}
        {expandedWorld && worldUnlocked ? <Text style={styles.availableChapters}>{chapterList.length} CHAPTERS AVAILABLE · {exerciseCount} PYTHON SPELLS</Text> : null}
        <View style={styles.playerPanel}>
          <View style={styles.playerIcon}><Text style={styles.playerIconText}>✦</Text></View>
          <View style={styles.playerInfo}><Text style={styles.playerLabel}>YOUR HERO</Text><Text style={styles.playerName}>Python Pyromancer</Text></View>
          <View style={styles.playerXp}><Text style={styles.playerXpValue}>{getTotalEarnedXp(progression)}</Text><Text style={styles.playerXpLabel}>TOTAL XP</Text></View>
        </View>
        <View style={styles.worldProgressRow}><Text style={styles.progressLabel}>{expandedWorld ? 'AVAILABLE CHAPTERS' : 'WORLD COMPLETION'}</Text><Text style={styles.progressPercent}>{worldProgress.percent}%</Text></View>
        <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: worldProgress.percent }}>
          <View style={[styles.progressFill, { width: `${worldProgress.percent}%` }]} />
        </View>

        {worldUnlocked ? <>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{forge ? 'THE RUNIC WORKSHOP' : archipelago ? 'THE TREASURE TRAIL' : caverns ? 'THE ECHOING PATH' : valley ? 'THE DIVIDED PATH' : 'THE ENCHANTED PATH'}</Text><Text style={styles.sectionHint}>{worldProgress.completed} / {worldProgress.total} {(archipelago || forge) ? 'COMPLETE' : 'CLEARED'}</Text></View>
        <View style={[styles.mapSurface, valley && styles.valleyMap, caverns && styles.cavernMap, archipelago && styles.islandMap, forge && styles.forgeMap]}>
          <View style={styles.mapCaption}><Text style={styles.mapCaptionText}>{forge ? '✧  SHAPE YOUR NEXT SPELL  ✧' : archipelago ? '◇  CHART YOUR COURSE  ◇' : '✧  FOLLOW THE RUNES  ✧'}</Text></View>
          {chapterList.map((chapter, index) => (
            <View key={chapter.id}>
              <ChapterNode chapter={chapter} index={index} state={getChapterState(progression, chapter)} onPress={() => setSelectedId(chapter.id)} pulse={pulse} />
              {index < chapterList.length - 1 ? (
                <View style={[styles.trailRow, index % 2 === 1 && styles.trailRowReverse]} pointerEvents="none">
                  <View style={[styles.trailCurve, index % 2 === 1 && styles.trailCurveReverse, archipelago && styles.bridgeTrail]} />
                  <Text style={styles.trailSparkle}>✧</Text>
                </View>
              ) : null}
            </View>
          ))}
          <Text style={styles.mapFooter}>{worldProgress.percent === 100 ? isWorldCleared(progression, world.id) ? `${world.title.toUpperCase()} CLEARED` : 'AVAILABLE CHAPTERS COMPLETE' : forge ? 'MORE SPELLS AWAIT THE FORGE' : archipelago ? 'NEW DISCOVERIES ACROSS THE SEA' : caverns ? 'FOLLOW THE CRYSTAL ECHOES' : valley ? 'CHOOSE YOUR PATH THROUGH THE VALLEY' : 'MORE OF THE FOREST AWAITS'}</Text>
        </View>
        </> : null}
      </GameScreen>

      <Modal transparent visible={!!selectedChapter} animationType="fade" onRequestClose={() => setSelectedId(null)} statusBarTranslucent>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          {selectedChapter ? <ChapterDetails chapter={selectedChapter} index={chapterList.indexOf(selectedChapter)} progress={progression} onClose={() => setSelectedId(null)} onOpenMission={(missionId) => {
            if (!isMissionUnlocked(progression, missionId)) return;
            if (navigation.open({ pathname: '/mission/[missionId]', params: { missionId } })) setSelectedId(null);
          }} /> : null}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  forgeBanner: { backgroundColor: '#302336', borderColor: '#D6A55D' },
  forgeAccent: { color: '#FFD181' },
  forgeMap: { backgroundColor: '#231F33', borderColor: '#68516A' },
  forgeCard: { backgroundColor: '#382B40', borderColor: '#D6A55D' },
  worldPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  worldChoice: { flex: 1, flexBasis: '45%', minWidth: 130, minHeight: 72, padding: 11, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, justifyContent: 'center' },
  islandBanner: { backgroundColor: '#123F4B', borderColor: '#72D3C6' },
  islandTitle: { fontSize: 30, lineHeight: 35 },
  islandMap: { backgroundColor: '#10333E', borderColor: '#438C98' },
  islandCard: { backgroundColor: '#20504C', borderColor: '#C7B47A' },
  bridgeTrail: { borderColor: '#C89B69', borderBottomWidth: 4 },
  cavernBanner: { backgroundColor: '#132C40', borderColor: '#54BECB' },
  cavernMap: { backgroundColor: '#112435', borderColor: '#3A8C9E' },
  cavernCard: { backgroundColor: '#193747', borderColor: '#64D4D0' },
  crystalText: { color: '#8CE9EB' },
  crystalRow: { flexDirection: 'row', gap: 28, marginTop: 23, marginBottom: 8 },
  crystal: { width: 34, height: 46, borderRadius: 8, borderWidth: 2, borderColor: '#8CE9EB', backgroundColor: '#27617B', transform: [{ rotate: '15deg' }], alignItems: 'center', justifyContent: 'center' },
  crystalRune: { color: '#C8FFFF', fontSize: 25 },
  worldChoiceSelected: { borderColor: colors.gold, backgroundColor: '#352C4B' },
  worldChoiceLabel: { color: colors.gold, fontSize: 9, fontWeight: '800' },
  worldChoiceTitle: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 5 },
  valleyBanner: { backgroundColor: '#2A2346', borderColor: '#8472AE' },
  valleyMap: { backgroundColor: '#201C34', borderColor: '#6A5685' },
  valleyPeaks: { color: colors.violet, fontSize: 32, marginTop: 12, letterSpacing: 5 },
  availableChapters: { color: colors.violet, fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 13 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, gap: 12 },
  worldNumber: { color: colors.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, flexShrink: 1, textAlign: 'right' },
  banner: { overflow: 'hidden', borderRadius: 24, backgroundColor: '#17332F', borderWidth: 1, borderColor: '#3F7767', paddingHorizontal: 24, paddingTop: 17, paddingBottom: 20, alignItems: 'center' },
  bannerStars: { color: colors.gold, fontSize: 17, letterSpacing: 7, marginBottom: 5 },
  bannerEyebrow: { color: '#A7EDCA', fontSize: 10, fontWeight: '900', letterSpacing: 2.5 },
  bannerTitle: { color: colors.text, fontSize: 35, fontWeight: '900', lineHeight: 39, textAlign: 'center', marginTop: 8 },
  bannerAccent: { color: colors.gold },
  bannerDescription: { color: '#BED2CA', fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 11, maxWidth: 290 },
  treeLine: { flexDirection: 'row', alignItems: 'flex-end', gap: 18, marginTop: 9, opacity: 0.44 },
  treeGlyph: { color: '#79C89E', fontSize: 41, lineHeight: 44 },
  treeGlyphSmall: { color: '#79C89E', fontSize: 27, lineHeight: 38 },
  playerPanel: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 13, marginTop: 15 },
  playerIcon: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.violet, backgroundColor: '#514784', justifyContent: 'center', alignItems: 'center' },
  playerIconText: { color: colors.gold, fontSize: 28 },
  playerInfo: { flex: 1 },
  playerLabel: { color: colors.violet, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  playerName: { color: colors.text, fontSize: 14, fontWeight: '900', marginTop: 3 },
  playerXp: { alignItems: 'flex-end' },
  playerXpValue: { color: colors.gold, fontSize: 19, fontWeight: '900' },
  playerXpLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  worldProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  progressLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  progressPercent: { color: colors.green, fontSize: 11, fontWeight: '900' },
  progressTrack: { height: 9, borderRadius: 8, backgroundColor: '#182E31', borderWidth: 1, borderColor: '#346052', overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', backgroundColor: colors.green },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 27, marginBottom: 11 },
  sectionTitle: { color: colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 1.6, flexShrink: 1 },
  sectionHint: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  mapSurface: { backgroundColor: '#101F29', borderWidth: 1, borderColor: '#2E594F', borderRadius: 26, paddingHorizontal: 11, paddingTop: 15, paddingBottom: 20, marginBottom: 15 },
  mapCaption: { alignItems: 'center', marginBottom: 15 },
  mapCaptionText: { color: '#78AA98', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },
  stopRow: { alignItems: 'flex-start' },
  stopRowRight: { alignItems: 'flex-end' },
  chapterCard: { width: '92%', minHeight: 115, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderWidth: 1, borderRadius: 19, borderColor: '#3D4D5F', backgroundColor: '#1C2839' },
  chapterCardAvailable: { borderColor: colors.green, backgroundColor: '#1D3A3C', shadowColor: colors.green, shadowOpacity: 0.2, shadowRadius: 11, elevation: 4 },
  chapterCardCompleted: { borderColor: colors.gold, backgroundColor: '#302F3F' },
  wardenCard: { borderColor: '#70E3EA', backgroundColor: '#152936' },
  bossCard: { borderColor: '#765B75', backgroundColor: '#33273F' },
  bossCardAvailable: { borderColor: colors.gold, backgroundColor: '#3B2C49', shadowColor: colors.gold, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  bossCardCompleted: { borderColor: colors.gold, backgroundColor: '#3B3341' },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  glyphFrame: { width: 54, height: 54, borderRadius: 16, borderWidth: 2, borderColor: '#536275', backgroundColor: '#29364A', justifyContent: 'center', alignItems: 'center' },
  glyphFrameAvailable: { borderColor: colors.green, backgroundColor: '#296451' },
  glyphFrameCompleted: { borderColor: colors.gold, backgroundColor: '#594A59' },
  bossGlyphFrame: { borderColor: '#BB8DBB', backgroundColor: '#604568' },
  bossGlyphFrameCompleted: { borderColor: colors.gold, backgroundColor: '#675044' },
  glyph: { color: colors.gold, fontSize: 30, fontWeight: '900' },
  glyphLocked: { color: '#8993A7' },
  chapterCopy: { flex: 1 },
  chapterTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chapterNumber: { color: colors.violet, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  lockedText: { color: '#8D91AA' },
  availableSparkle: { color: colors.green, fontSize: 17 },
  chapterTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 },
  lockedTitle: { color: '#C0C3D2' },
  chapterMeta: { color: colors.muted, fontSize: 9, fontWeight: '700', marginTop: 4, letterSpacing: 0.6 },
  statusText: { color: '#8E99AA', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 7 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lockMark: { width: 13, height: 15, alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 },
  lockShackle: { position: 'absolute', top: 0, width: 9, height: 9, borderWidth: 2, borderBottomWidth: 0, borderColor: '#9298AC', borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  lockBody: { width: 13, height: 9, borderRadius: 2, backgroundColor: '#9298AC' },
  availableText: { color: colors.green },
  completedText: { color: colors.gold },
  trailRow: { height: 53, width: '70%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  trailRowReverse: { flexDirection: 'row-reverse' },
  trailCurve: { width: '70%', height: 28, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#4D987B', borderBottomRightRadius: 25, transform: [{ rotate: '12deg' }] },
  trailCurveReverse: { borderRightWidth: 0, borderLeftWidth: 2, borderBottomRightRadius: 0, borderBottomLeftRadius: 25, transform: [{ rotate: '-12deg' }] },
  trailSparkle: { color: colors.gold, fontSize: 15, marginHorizontal: 6 },
  mapFooter: { textAlign: 'center', color: '#79A391', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginTop: 20 },
  modalSafe: { flex: 1, backgroundColor: 'rgba(4, 8, 18, 0.75)' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1B203C', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderBottomWidth: 0, borderColor: '#5E5B80', maxHeight: '88%', paddingHorizontal: 21, paddingTop: 11 },
  sheetHandle: { width: 46, height: 4, borderRadius: 3, backgroundColor: '#747591', alignSelf: 'center', marginBottom: 14 },
  sheetHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sheetEyebrow: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, flexShrink: 1, textAlign: 'right' },
  sheetScroll: { paddingBottom: 28 },
  sheetTitle: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 1 },
  sheetStatus: { color: '#9AA1B8', fontSize: 12, fontWeight: '900', marginTop: 8 },
  sheetDescription: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 15 },
  objectiveCard: { backgroundColor: '#233C40', borderWidth: 1, borderColor: '#477367', borderRadius: 16, padding: 15, marginTop: 21 },
  detailLabel: { color: colors.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  objectiveText: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 7 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 17 },
  stat: { flex: 1, minHeight: 70, borderRadius: 13, backgroundColor: '#272B4A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  statValue: { color: colors.gold, fontSize: 18, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 0.7, marginTop: 4, textAlign: 'center' },
  detailProgressTrack: { height: 7, borderRadius: 6, backgroundColor: '#11182D', overflow: 'hidden', marginTop: 15 },
  detailProgressFill: { height: '100%', backgroundColor: colors.green },
  noticeCard: { borderWidth: 1, borderColor: '#64637C', borderRadius: 16, backgroundColor: '#272A43', padding: 16, marginTop: 23 },
  noticeTitle: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  noticeText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  missionsSection: { marginTop: 24 },
  missionPreview: { backgroundColor: '#292D4B', borderWidth: 1, borderColor: '#4B5574', borderRadius: 16, padding: 15, marginTop: 10 },
  missionPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  missionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', flex: 1 },
  missionXp: { color: colors.gold, fontSize: 10, fontWeight: '900' },
  missionDescription: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  missionComplete: { color: colors.green, fontSize: 10, fontWeight: '900', marginTop: 9 },
  missionAction: { alignSelf: 'flex-start', minHeight: 44, minWidth: 145, borderRadius: 11, backgroundColor: '#315147', borderWidth: 1, borderColor: colors.green, justifyContent: 'center', paddingHorizontal: 13, marginTop: 12 },
  missionActionText: { color: colors.text, fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
});
