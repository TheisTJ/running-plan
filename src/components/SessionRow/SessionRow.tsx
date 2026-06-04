import type { Session } from "../../types";
import styles from "./SessionRow.module.css";

interface SessionRowProps {
  session: Session;
  done: boolean;
  isLast: boolean;
  onToggle: () => void;
}

export function SessionRow({ session, done, isLast, onToggle }: SessionRowProps) {
  const rowClass = [styles.row, done ? styles.rowDone : "", isLast ? "" : styles.divided]
    .filter(Boolean)
    .join(" ");
  const detailClass = [styles.detail, done ? styles.detailDone : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rowClass}
      onClick={onToggle}
      role="checkbox"
      aria-checked={done}
      aria-label={`${session.label}: ${session.detail}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className={styles.checkbox} data-checked={done}>
        {done ? "✓" : ""}
      </div>
      <div className={styles.body}>
        <div className={styles.label}>{session.label}</div>
        <div className={detailClass}>{session.detail}</div>
      </div>
      <div className={styles.badge}>{session.totalRun} min run</div>
    </div>
  );
}
