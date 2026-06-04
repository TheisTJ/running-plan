import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "running-plan:progress";

/** Map of `"${weekIdx}-${sessionIdx}"` → completed?. */
export type CompletedMap = Record<string, boolean>;

/** Build the storage key for a given week/session index pair. */
export function sessionKey(weekIdx: number, sessionIdx: number): string {
  return `${weekIdx}-${sessionIdx}`;
}

function loadInitial(): CompletedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as CompletedMap;
    }
    return {};
  } catch {
    // Corrupt/unavailable storage — start fresh rather than crash.
    return {};
  }
}

export interface UseProgress {
  completed: CompletedMap;
  toggleSession: (weekIdx: number, sessionIdx: number) => void;
  /** Mark every session in a week done (or not done) in one update. */
  setWeekDone: (weekIdx: number, sessionCount: number, done: boolean) => void;
  isDone: (weekIdx: number, sessionIdx: number) => boolean;
  completedCount: number;
}

/**
 * Tracks which sessions are completed, persisting to localStorage so progress
 * survives a page reload.
 */
export function useProgress(): UseProgress {
  const [completed, setCompleted] = useState<CompletedMap>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // Storage may be full or disabled (e.g. private mode) — ignore.
    }
  }, [completed]);

  const toggleSession = useCallback((weekIdx: number, sessionIdx: number) => {
    const key = sessionKey(weekIdx, sessionIdx);
    setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setWeekDone = useCallback(
    (weekIdx: number, sessionCount: number, done: boolean) => {
      setCompleted((prev) => {
        const next = { ...prev };
        for (let i = 0; i < sessionCount; i++) {
          next[sessionKey(weekIdx, i)] = done;
        }
        return next;
      });
    },
    [],
  );

  const isDone = useCallback(
    (weekIdx: number, sessionIdx: number) =>
      !!completed[sessionKey(weekIdx, sessionIdx)],
    [completed],
  );

  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed],
  );

  return { completed, toggleSession, setWeekDone, isDone, completedCount };
}
