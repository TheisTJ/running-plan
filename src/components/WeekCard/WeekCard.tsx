import type { Week } from "../../types";
import { SessionRow } from "../SessionRow/SessionRow";
import styles from "./WeekCard.module.css";

interface WeekCardProps {
  week: Week;
  weekIdx: number;
  isDone: (weekIdx: number, sessionIdx: number) => boolean;
  onToggle: (weekIdx: number, sessionIdx: number) => void;
  weekCompleted: boolean;
}

export function WeekCard({
  week,
  weekIdx,
  isDone,
  onToggle,
  weekCompleted,
}: WeekCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Week {week.week}</div>
          <div className={styles.goal}>{week.goal}</div>
        </div>
        {weekCompleted && <div className={styles.badge}>✓ Complete</div>}
      </div>

      {week.sessions.map((session, i) => (
        <SessionRow
          key={i}
          session={session}
          done={isDone(weekIdx, i)}
          isLast={i === week.sessions.length - 1}
          onToggle={() => onToggle(weekIdx, i)}
        />
      ))}
    </div>
  );
}
