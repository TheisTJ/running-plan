import { useEffect, useMemo, useRef, useState } from "react";
import { weeks } from "../../data/weeks";
import { tips } from "../../data/tips";
import { firstUnfinishedWeek, useProgress } from "../../hooks/useProgress";
import { Header } from "../Header/Header";
import { WeekSelector } from "../WeekSelector/WeekSelector";
import { WeekCard } from "../WeekCard/WeekCard";
import { Tips } from "../Tips/Tips";
import styles from "./RunningPlan.module.css";

const LAST_WEEK = weeks.length - 1;

export function RunningPlan() {
  const { completed, isDone, toggleSession, setWeekDone, completedCount } =
    useProgress();

  const sessionCounts = useMemo(() => weeks.map((w) => w.sessions.length), []);

  // Open on the week the user is currently working on. Seeded synchronously
  // from localStorage so returning users see no flash.
  const [activeWeek, setActiveWeek] = useState(() =>
    firstUnfinishedWeek(sessionCounts, completed),
  );

  // Re-target the week when the remote (shared-row) progress arrives, but stop
  // once the user navigates or ticks a session — never yank them off the week
  // they're looking at. `userTouched` is set synchronously in the handlers
  // below, before the resulting state change re-runs this effect.
  const userTouched = useRef(false);
  useEffect(() => {
    if (userTouched.current) return;
    setActiveWeek(firstUnfinishedWeek(sessionCounts, completed));
  }, [completed, sessionCounts]);

  const selectWeek = (weekIdx: number) => {
    userTouched.current = true;
    setActiveWeek(weekIdx);
  };

  const handleToggleSession = (weekIdx: number, sessionIdx: number) => {
    userTouched.current = true;
    toggleSession(weekIdx, sessionIdx);
  };

  const totalSessions = useMemo(
    () => weeks.reduce((sum, w) => sum + w.sessions.length, 0),
    [],
  );
  const progressPct = Math.round((completedCount / totalSessions) * 100);

  const isWeekDone = (weekIdx: number) =>
    weeks[weekIdx].sessions.every((_, si) => isDone(weekIdx, si));

  // Flip an entire week: complete it if not already done, otherwise clear it.
  const toggleWeek = (weekIdx: number) => {
    userTouched.current = true;
    setWeekDone(weekIdx, weeks[weekIdx].sessions.length, !isWeekDone(weekIdx));
  };

  return (
    <div className={styles.page}>
      <Header
        completedCount={completedCount}
        totalSessions={totalSessions}
        progressPct={progressPct}
      />

      <div className={styles.content}>
        <WeekSelector
          weeks={weeks}
          activeWeek={activeWeek}
          onSelect={selectWeek}
          onToggleWeek={toggleWeek}
          isWeekDone={isWeekDone}
        />

        <WeekCard
          week={weeks[activeWeek]}
          weekIdx={activeWeek}
          isDone={isDone}
          onToggle={handleToggleSession}
          onToggleAll={() => toggleWeek(activeWeek)}
          weekCompleted={isWeekDone(activeWeek)}
        />

        <nav className={styles.nav}>
          <button
            className={styles.navButton}
            onClick={() => selectWeek(Math.max(0, activeWeek - 1))}
            disabled={activeWeek === 0}
          >
            ← Previous week
          </button>
          <button
            className={styles.navButton}
            onClick={() => selectWeek(Math.min(LAST_WEEK, activeWeek + 1))}
            disabled={activeWeek === LAST_WEEK}
          >
            Next week →
          </button>
        </nav>

        <Tips tips={tips} />
      </div>
    </div>
  );
}
