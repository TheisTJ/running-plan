import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROGRESS_TABLE, SHARED_PROGRESS_ID, supabase } from "../lib/supabase";

const STORAGE_KEY = "running-plan:progress";

/** Debounce window before pushing a user change to the remote. */
const PUSH_DELAY_MS = 600;

/** Map of `"${weekIdx}-${sessionIdx}"` → completed?. */
export type CompletedMap = Record<string, boolean>;

/** Where the user's progress is currently being kept. */
export type SyncStatus = "local" | "syncing" | "synced" | "offline";

/** Build the storage key for a given week/session index pair. */
export function sessionKey(weekIdx: number, sessionIdx: number): string {
  return `${weekIdx}-${sessionIdx}`;
}

/**
 * The week to resume on: the first week that isn't fully complete, or the last
 * week if every session is done. `sessionCounts[w]` is the number of sessions
 * in week `w`.
 */
export function firstUnfinishedWeek(
  sessionCounts: number[],
  completed: CompletedMap,
): number {
  for (let w = 0; w < sessionCounts.length; w++) {
    const allDone = Array.from(
      { length: sessionCounts[w] },
      (_, s) => completed[sessionKey(w, s)],
    ).every(Boolean);
    if (!allDone) return w;
  }
  return Math.max(0, sessionCounts.length - 1);
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
  /** Where progress is currently kept (for UI feedback). */
  syncStatus: SyncStatus;
}

/**
 * Tracks which sessions are completed. Always persists to localStorage so
 * progress survives a reload offline; when Supabase is configured, it also
 * syncs to a single shared remote row, so every device that opens the site
 * sees the same progress. localStorage is the source of truth when offline /
 * unconfigured.
 */
export function useProgress(): UseProgress {
  const [completed, setCompleted] = useState<CompletedMap>(loadInitial);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    supabase ? "syncing" : "local",
  );

  // A ref lets the stable pull/push callbacks read the latest completed map
  // without being torn down and recreated on every change.
  const completedRef = useRef(completed);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  // True when the last state change came from a remote pull, so the push effect
  // below knows not to echo it straight back to the server.
  const remoteApplied = useRef(false);
  // Skip the very first push (mount value is not a user action) so a slow pull
  // can't be overwritten by stale local state.
  const skipFirstPush = useRef(true);

  // Always cache locally — offline resilience + the no-Supabase fallback.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // Storage may be full or disabled (e.g. private mode) — ignore.
    }
  }, [completed]);

  const push = useCallback(async (map: CompletedMap) => {
    if (!supabase) return;
    setSyncStatus("syncing");
    try {
      const { error } = await supabase.from(PROGRESS_TABLE).upsert({
        id: SHARED_PROGRESS_ID,
        data: map,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSyncStatus("synced");
    } catch {
      // Network/permission failure — keep using localStorage, retry on next change.
      setSyncStatus("offline");
    }
  }, []);

  const pull = useCallback(async () => {
    if (!supabase) return;
    setSyncStatus("syncing");
    try {
      const { data, error } = await supabase
        .from(PROGRESS_TABLE)
        .select("data")
        .eq("id", SHARED_PROGRESS_ID)
        .maybeSingle();
      if (error) throw error;
      const remote = data?.data;
      if (remote && typeof remote === "object") {
        // Only apply (and flag) when it actually differs, so the skip-echo flag
        // doesn't get stuck set when remote == local.
        if (JSON.stringify(remote) !== JSON.stringify(completedRef.current)) {
          remoteApplied.current = true;
          setCompleted(remote as CompletedMap);
        }
        setSyncStatus("synced");
      } else {
        // No remote row yet — seed it from whatever we have locally.
        await push(completedRef.current);
      }
    } catch {
      setSyncStatus("offline");
    }
  }, [push]);

  // Pull the shared row on mount.
  useEffect(() => {
    void pull();
  }, [pull]);

  // Debounced push on user-driven changes.
  useEffect(() => {
    if (!supabase) return;
    if (remoteApplied.current) {
      remoteApplied.current = false;
      return;
    }
    if (skipFirstPush.current) {
      skipFirstPush.current = false;
      return;
    }
    const timer = setTimeout(() => void push(completed), PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [completed, push]);

  // Re-pull when the tab regains focus, to pick up edits from another device.
  useEffect(() => {
    if (!supabase) return;
    const refresh = () => {
      if (document.visibilityState !== "hidden") void pull();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [pull]);

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

  return {
    completed,
    toggleSession,
    setWeekDone,
    isDone,
    completedCount,
    syncStatus,
  };
}
