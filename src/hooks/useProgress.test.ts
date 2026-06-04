import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { sessionKey, useProgress } from "./useProgress";

const STORAGE_KEY = "running-plan:progress";

describe("useProgress", () => {
  it("starts empty with no completed sessions", () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.completedCount).toBe(0);
    expect(result.current.isDone(0, 0)).toBe(false);
  });

  it("toggles a session on and off", () => {
    const { result } = renderHook(() => useProgress());

    act(() => result.current.toggleSession(2, 1));
    expect(result.current.isDone(2, 1)).toBe(true);
    expect(result.current.completedCount).toBe(1);

    act(() => result.current.toggleSession(2, 1));
    expect(result.current.isDone(2, 1)).toBe(false);
    expect(result.current.completedCount).toBe(0);
  });

  it("persists completed sessions to localStorage", () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.toggleSession(0, 0));

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({ [sessionKey(0, 0)]: true });
  });

  it("rehydrates from localStorage on mount", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ [sessionKey(1, 2)]: true }),
    );
    const { result } = renderHook(() => useProgress());
    expect(result.current.isDone(1, 2)).toBe(true);
    expect(result.current.completedCount).toBe(1);
  });

  it("recovers from corrupt localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{");
    const { result } = renderHook(() => useProgress());
    expect(result.current.completedCount).toBe(0);
  });
});
