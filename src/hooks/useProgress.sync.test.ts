import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

// Mock the Supabase client so the hook exercises its remote-sync path without
// any network. The chain mirrors `from(table).select(cols).eq(col,val).maybeSingle()`
// and `from(table).upsert(row)`.
interface ProgressRow {
  id: string;
  data: Record<string, boolean>;
  updated_at: string;
}

// Defined via vi.hoisted so the (hoisted) vi.mock factory below can reference them.
const { from, maybeSingle, upsert } = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const upsert = vi.fn<(row: ProgressRow) => Promise<{ error: null }>>(() =>
    Promise.resolve({ error: null }),
  );
  const from = vi.fn(() => ({ select, upsert }));
  return { from, maybeSingle, upsert };
});

vi.mock("../lib/supabase", () => ({
  supabase: { from },
  PROGRESS_TABLE: "progress",
  SHARED_PROGRESS_ID: "shared",
}));

import { useProgress } from "./useProgress";
import { SHARED_PROGRESS_ID } from "../lib/supabase";

describe("useProgress remote sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default: no remote row yet.
    maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it("adopts remote progress on mount", async () => {
    maybeSingle.mockResolvedValue({
      data: { data: { "1-2": true } },
      error: null,
    });

    const { result } = renderHook(() => useProgress());

    await waitFor(() => expect(result.current.isDone(1, 2)).toBe(true));
    expect(result.current.completedCount).toBe(1);
    expect(result.current.syncStatus).toBe("synced");
  });

  it("seeds the remote row when none exists yet", async () => {
    renderHook(() => useProgress());
    // No remote row → the hook upserts the (empty) local state to create it.
    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    expect(upsert.mock.calls[0][0]).toMatchObject({ data: {} });
  });

  it("pushes user changes to the remote", async () => {
    const { result } = renderHook(() => useProgress());
    await waitFor(() => expect(from).toHaveBeenCalled()); // initial pull done
    upsert.mockClear();

    act(() => result.current.toggleSession(0, 0));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    const calls = upsert.mock.calls;
    const lastArg = calls[calls.length - 1][0];
    expect(lastArg.id).toBe(SHARED_PROGRESS_ID);
    expect(lastArg.data).toEqual({ "0-0": true });
  });

  it("falls back to offline status when the remote errors", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: new Error("boom") });
    const { result } = renderHook(() => useProgress());
    await waitFor(() => expect(result.current.syncStatus).toBe("offline"));
  });
});
