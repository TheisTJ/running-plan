import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSyncCode } from "./useSyncCode";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("useSyncCode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a stable, valid v4 sync code on first use", () => {
    const { result } = renderHook(() => useSyncCode());
    expect(result.current.syncCode).toMatch(UUID_V4);
  });

  // Regression: over plain HTTP (insecure context) `crypto.randomUUID` is
  // undefined. Calling it threw during the useState initializer and blanked the
  // whole app on troyborg.dk. The hook must still produce a valid code instead.
  describe("when crypto.randomUUID is unavailable (insecure context / HTTP)", () => {
    const original = crypto.randomUUID;

    beforeEach(() => {
      Object.defineProperty(crypto, "randomUUID", {
        value: undefined,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(crypto, "randomUUID", {
        value: original,
        configurable: true,
      });
    });

    it("falls back to getRandomValues and still returns a valid v4 code", () => {
      const { result } = renderHook(() => useSyncCode());
      expect(result.current.syncCode).toMatch(UUID_V4);
    });
  });
});
