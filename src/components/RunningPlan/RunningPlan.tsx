import { useMemo, useState } from "react";
import { weeks } from "../../data/weeks";
import { tips } from "../../data/tips";
import { useProgress } from "../../hooks/useProgress";
import { Header } from "../Header/Header";
import { WeekSelector } from "../WeekSelector/WeekSelector";
import { WeekCard } from "../WeekCard/WeekCard";
import { Tips } from "../Tips/Tips";
import styles from "./RunningPlan.module.css";

const LAST_WEEK = weeks.length - 1;

export function RunningPlan() {
  const { isDone, toggleSession, completedCount } = useProgress();
  const [activeWeek, setActiveWeek] = useState(0);

  const totalSessions = useMemo(
    () => weeks.reduce((sum, w) => sum + w.sessions.length, 0),
    [],
  );
  const progressPct = Math.round((completedCount / totalSessions) * 100);

  const isWeekDone = (weekIdx: number) =>
    weeks[weekIdx].sessions.every((_, si) => isDone(weekIdx, si));

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
          onSelect={setActiveWeek}
          isWeekDone={isWeekDone}
        />

        <WeekCard
          week={weeks[activeWeek]}
          weekIdx={activeWeek}
          isDone={isDone}
          onToggle={toggleSession}
          weekCompleted={isWeekDone(activeWeek)}
        />

        <nav className={styles.nav}>
          <button
            className={styles.navButton}
            onClick={() => setActiveWeek((w) => Math.max(0, w - 1))}
            disabled={activeWeek === 0}
          >
            ← Previous week
          </button>
          <button
            className={styles.navButton}
            onClick={() => setActiveWeek((w) => Math.min(LAST_WEEK, w + 1))}
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
