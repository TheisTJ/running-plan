import { useCallback, useState } from "react";

const SYNC_CODE_KEY = "running-plan:sync-code";

/**
 * Returns a stable sync code for this browser, generating one on first use.
 * The code is the only secret protecting your data, so it's an unguessable
 * UUID. Paste another device's code via `setSyncCode` to share progress.
 */
function loadOrCreate(): string {
  try {
    const existing = localStorage.getItem(SYNC_CODE_KEY);
    if (existing) return existing;
  } catch {
    // Storage unavailable (private mode) — fall through to an ephemeral code.
  }
  const code = crypto.randomUUID();
  try {
    localStorage.setItem(SYNC_CODE_KEY, code);
  } catch {
    // Ignore — we still return a usable in-memory code for this session.
  }
  return code;
}

export interface UseSyncCode {
  syncCode: string;
  /** Switch to an existing code (e.g. one copied from another device). */
  setSyncCode: (code: string) => void;
}

export function useSyncCode(): UseSyncCode {
  const [syncCode, setSyncCodeState] = useState<string>(loadOrCreate);

  const setSyncCode = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed || trimmed === syncCode) return;
    try {
      localStorage.setItem(SYNC_CODE_KEY, trimmed);
    } catch {
      // Ignore — state still updates for this session.
    }
    setSyncCodeState(trimmed);
  }, [syncCode]);

  return { syncCode, setSyncCode };
}
