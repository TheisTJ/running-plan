import { useCallback, useState } from "react";

const SYNC_CODE_KEY = "running-plan:sync-code";

/**
 * Generate an RFC-4122 v4 UUID. `crypto.randomUUID()` only exists in a secure
 * context (HTTPS / localhost); over plain HTTP it's undefined and would throw,
 * blanking the whole app on first render. Fall back to `getRandomValues` (which,
 * unlike `randomUUID`, is available in insecure contexts too), and to
 * `Math.random` only if Web Crypto is entirely unavailable.
 */
function randomUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

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
  const code = randomUuid();
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
