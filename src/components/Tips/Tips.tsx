import type { Tip } from "../../types";
import styles from "./Tips.module.css";

interface TipsProps {
  tips: Tip[];
}

export function Tips({ tips }: TipsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.kicker}>Key principles</div>
      <div className={styles.grid}>
        {tips.map((t, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.icon}>{t.icon}</div>
            <div className={styles.title}>{t.title}</div>
            <div className={styles.body}>{t.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
