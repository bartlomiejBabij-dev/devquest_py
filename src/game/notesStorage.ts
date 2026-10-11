import { exercises } from './worldContent';

export const NOTES_STORAGE_KEY = 'devquest.notes.v1';
export const MAX_NOTE_LENGTH = 1000;
const STORAGE_VERSION = 1;

export type NotesState = Record<string, string>;

export interface NotesStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export type NotesLoadResult =
  | { status: 'ready'; notes: NotesState }
  | { status: 'unavailable'; notes: NotesState; reason: 'read-failed' | 'invalid-save' | 'unsupported-version' };

const validExerciseIds = new Set(exercises.map((exercise) => exercise.id));

export function isValidExerciseId(exerciseId: string): boolean {
  return validExerciseIds.has(exerciseId);
}

function validNoteEntries(notes: NotesState): NotesState {
  const result: NotesState = {};
  for (const [id, text] of Object.entries(notes)) {
    if (isValidExerciseId(id) && typeof text === 'string' && text.trim().length > 0) {
      result[id] = text.slice(0, MAX_NOTE_LENGTH);
    }
  }
  return result;
}

export function setExerciseNote(notes: NotesState, exerciseId: string, text: string): NotesState {
  if (!isValidExerciseId(exerciseId)) return notes;
  if (text.trim().length === 0) return deleteExerciseNote(notes, exerciseId);
  const nextText = text.slice(0, MAX_NOTE_LENGTH);
  if (notes[exerciseId] === nextText) return notes;
  return { ...notes, [exerciseId]: nextText };
}

export function deleteExerciseNote(notes: NotesState, exerciseId: string): NotesState {
  if (!isValidExerciseId(exerciseId) || !Object.hasOwn(notes, exerciseId)) return notes;
  const next = { ...notes };
  delete next[exerciseId];
  return next;
}

export function parseSavedNotes(raw: string): NotesLoadResult {
  let value: unknown;
  try { value = JSON.parse(raw); } catch {
    return { status: 'unavailable', notes: {}, reason: 'invalid-save' };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { status: 'unavailable', notes: {}, reason: 'invalid-save' };
  }
  const record = value as Record<string, unknown>;
  if (record.version !== STORAGE_VERSION) {
    return { status: 'unavailable', notes: {},
      reason: typeof record.version === 'number' && record.version > STORAGE_VERSION ? 'unsupported-version' : 'invalid-save' };
  }
  if (!record.notes || typeof record.notes !== 'object' || Array.isArray(record.notes)) {
    return { status: 'unavailable', notes: {}, reason: 'invalid-save' };
  }
  return { status: 'ready', notes: validNoteEntries(record.notes as NotesState) };
}

export function createNotesStore(storage: NotesStorageAdapter) {
  let pendingWrite: Promise<void> = Promise.resolve();
  return {
    async load(): Promise<NotesLoadResult> {
      try {
        const raw = await storage.getItem(NOTES_STORAGE_KEY);
        return raw === null ? { status: 'ready', notes: {} } : parseSavedNotes(raw);
      } catch {
        return { status: 'unavailable', notes: {}, reason: 'read-failed' };
      }
    },
    save(notes: NotesState): Promise<boolean> {
      const payload = JSON.stringify({ version: STORAGE_VERSION, notes: validNoteEntries(notes) });
      const write = pendingWrite.then(async () => {
        try { await storage.setItem(NOTES_STORAGE_KEY, payload); return true; }
        catch { return false; }
      });
      pendingWrite = write.then(() => undefined);
      return write;
    },
  };
}
