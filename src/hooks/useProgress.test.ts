import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  firstUnfinishedWeek,
  sessionKey,
  useProgress,
  type CompletedMap,
} from "./useProgress";

const STORAGE_KEY = "running-plan:progress";

describe("firstUnfinishedWeek", () => {
  const counts = [3, 3, 3, 3, 3]; // 5 weeks × 3 sessions

  const doneThrough = (weekCount: number): CompletedMap => {
    const map: CompletedMap = {};
    for (let w = 0; w < weekCount; w++) {
      for (let s = 0; s < 3; s++) map[sessionKey(w, s)] = true;
    }
    return map;
  };

  it("returns 0 when nothing is done", () => {
    expect(firstUnfinishedWeek(counts, {})).toBe(0);
  });

  it("returns the next week after a fully completed one", () => {
    expect(firstUnfinishedWeek(counts, doneThrough(1))).toBe(1);
    expect(firstUnfinishedWeek(counts, doneThrough(3))).toBe(3);
  });

  it("returns a partially completed week itself", () => {
    expect(firstUnfinishedWeek(counts, { [sessionKey(2, 0)]: true })).toBe(0);
    expect(
      firstUnfinishedWeek(counts, {
        ...doneThrough(2),
        [sessionKey(2, 0)]: true,
      }),
    ).toBe(2);
  });

  it("returns the last week when everything is done", () => {
    expect(firstUnfinishedWeek(counts, doneThrough(5))).toBe(4);
  });
});

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

  it("marks and clears a whole week with setWeekDone", () => {
    const { result } = renderHook(() => useProgress());

    act(() => result.current.setWeekDone(3, 3, true));
    expect(result.current.isDone(3, 0)).toBe(true);
    expect(result.current.isDone(3, 1)).toBe(true);
    expect(result.current.isDone(3, 2)).toBe(true);
    expect(result.current.completedCount).toBe(3);

    act(() => result.current.setWeekDone(3, 3, false));
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
