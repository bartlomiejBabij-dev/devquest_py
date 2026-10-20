// Historical conversion tests still assert their complete original snapshots.
// Project only the pre-3G.3A registry; new registrations and totals are tested
// independently in shortAdventures.test.cjs against the pre-edit fixture.
const current = require('../../src/game/worldContent.ts');
const { exerciseSpellbookEntryIds } = require('../../src/game/spellbookContent.ts');
const baseline = require('../fixtures/short-adventures-compatibility.json');
const existing = (items, hashes) => items.filter(item => Object.hasOwn(hashes, item.id));
module.exports = {
  worlds: current.worlds.filter(world => ['python-forest-of-variables', 'python-valley-of-decisions'].includes(world.id)).map(world => world.id === 'python-valley-of-decisions'
    ? { ...world, chapterIds: world.chapterIds.filter(id => Object.hasOwn(baseline.chapters, id)), xpReward: 150 }
    : world),
  chapters: existing(current.chapters, baseline.chapters),
  missions: existing(current.missions, baseline.missions),
  exercises: existing(current.exercises, baseline.exercises),
  spellbookLinks: Object.fromEntries(Object.entries(exerciseSpellbookEntryIds).filter(([id]) => Object.hasOwn(baseline.exercises, id))),
};
