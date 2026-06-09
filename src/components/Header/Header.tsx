import styles from "./Header.module.css";

interface HeaderProps {
  completedCount: number;
  totalSessions: number;
  progressPct: number;
}

export function Header({
  completedCount,
  totalSessions,
  progressPct,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.glow} />
      <div className={styles.inner}>
        <div className={styles.kicker}>10-Week Program</div>
        <h1 className={styles.title}>
          0 → 30 Minutes
          <br />
          <span className={styles.titleAccent}>Non-Stop Running</span>
        </h1>
        <p className={styles.subtitle}>
          Starting from 5 minutes. Three sessions per week. No rushing.
        </p>

        <div className={styles.progress}>
          <div className={styles.progressLabel}>
            <span>
              {completedCount} of {totalSessions} sessions done
            </span>
            <span className={styles.progressPct}>{progressPct}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPct}%` }}
            />
            <span
              className={styles.runner}
              style={{ left: `${progressPct}%` }}
              aria-hidden="true"
            >
              🏃
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
