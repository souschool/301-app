import type { NoteSet } from "@/types";

const STORAGE_KEY = "note-sets";

export function loadNoteSets(): NoteSet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NoteSet[];
  } catch {
    return [];
  }
}

export function saveNoteSet(noteSet: NoteSet): void {
  if (typeof window === "undefined") return;
  const existing = loadNoteSets();
  const updated = [noteSet, ...existing.filter((s) => s.id !== noteSet.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteNoteSet(id: string): void {
  if (typeof window === "undefined") return;
  const existing = loadNoteSets();
  const updated = existing.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
