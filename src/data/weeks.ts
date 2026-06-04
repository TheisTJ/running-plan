import type { Week } from "../types";

export const weeks: Week[] = [
  {
    week: 1,
    goal: "Build the habit",
    sessions: [
      {
        label: "Session A",
        detail: "Run 5 min → Walk 2 min → Run 5 min",
        totalRun: 10,
      },
      {
        label: "Session B",
        detail: "Run 5 min → Walk 2 min → Run 5 min",
        totalRun: 10,
      },
      {
        label: "Session C",
        detail: "Run 6 min → Walk 2 min → Run 6 min",
        totalRun: 12,
      },
    ],
  },
  {
    week: 2,
    goal: "Stretch the runs",
    sessions: [
      {
        label: "Session A",
        detail: "Run 7 min → Walk 2 min → Run 7 min",
        totalRun: 14,
      },
      {
        label: "Session B",
        detail: "Run 8 min → Walk 2 min → Run 7 min",
        totalRun: 15,
      },
      {
        label: "Session C",
        detail: "Run 8 min → Walk 2 min → Run 8 min",
        totalRun: 16,
      },
    ],
  },
  {
    week: 3,
    goal: "Push past comfort",
    sessions: [
      {
        label: "Session A",
        detail: "Run 10 min → Walk 2 min → Run 8 min",
        totalRun: 18,
      },
      {
        label: "Session B",
        detail: "Run 10 min → Walk 2 min → Run 10 min",
        totalRun: 20,
      },
      {
        label: "Session C",
        detail: "Run 12 min → Walk 2 min → Run 10 min",
        totalRun: 22,
      },
    ],
  },
  {
    week: 4,
    goal: "Recovery week — consolidate gains",
    sessions: [
      {
        label: "Session A",
        detail: "Easy run: 10 min continuous, relaxed pace",
        totalRun: 10,
      },
      {
        label: "Session B",
        detail: "Run 12 min → Walk 1 min → Run 5 min",
        totalRun: 17,
      },
      {
        label: "Session C",
        detail: "Run 15 min continuous — slow & steady",
        totalRun: 15,
      },
    ],
  },
  {
    week: 5,
    goal: "First long run",
    sessions: [
      {
        label: "Session A",
        detail: "Run 15 min → Walk 2 min → Run 5 min",
        totalRun: 20,
      },
      {
        label: "Session B",
        detail: "Run 18 min → Walk 1 min → Run 5 min",
        totalRun: 23,
      },
      {
        label: "Session C",
        detail: "Run 20 min continuous 🎉",
        totalRun: 20,
      },
    ],
  },
  {
    week: 6,
    goal: "Consistency at 20 min",
    sessions: [
      { label: "Session A", detail: "Run 20 min continuous", totalRun: 20 },
      { label: "Session B", detail: "Run 22 min continuous", totalRun: 22 },
      { label: "Session C", detail: "Run 23 min continuous", totalRun: 23 },
    ],
  },
  {
    week: 7,
    goal: "Bridge to 25 min",
    sessions: [
      {
        label: "Session A",
        detail: "Run 22 min → Walk 1 min → Run 3 min",
        totalRun: 25,
      },
      { label: "Session B", detail: "Run 24 min continuous", totalRun: 24 },
      { label: "Session C", detail: "Run 25 min continuous", totalRun: 25 },
    ],
  },
  {
    week: 8,
    goal: "Recovery week — feel strong",
    sessions: [
      {
        label: "Session A",
        detail: "Easy 20 min run, very relaxed pace",
        totalRun: 20,
      },
      { label: "Session B", detail: "Run 22 min continuous", totalRun: 22 },
      { label: "Session C", detail: "Run 25 min continuous", totalRun: 25 },
    ],
  },
  {
    week: 9,
    goal: "Final push",
    sessions: [
      { label: "Session A", detail: "Run 26 min continuous", totalRun: 26 },
      { label: "Session B", detail: "Run 28 min continuous", totalRun: 28 },
      { label: "Session C", detail: "Run 29 min continuous", totalRun: 29 },
    ],
  },
  {
    week: 10,
    goal: "You made it!",
    sessions: [
      {
        label: "Session A",
        detail: "Easy shakeout: 20 min relaxed",
        totalRun: 20,
      },
      {
        label: "Session B",
        detail: "Run 25 min — feel confident",
        totalRun: 25,
      },
      {
        label: "Session C",
        detail: "🏃 RUN 30 MINUTES NON-STOP! 🎉",
        totalRun: 30,
      },
    ],
  },
];
