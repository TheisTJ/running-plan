import { useState } from "react";
import type { Tip } from "../../types";
import styles from "./Tips.module.css";

interface TipsProps {
  tips: Tip[];
}

export function Tips({ tips }: TipsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="tips-grid"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.kicker}>Key principles</span>
        <span
          className={[styles.chevron, open ? styles.chevronOpen : ""]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div id="tips-grid" className={styles.grid}>
          {tips.map((t, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{t.icon}</div>
              <div className={styles.title}>{t.title}</div>
              <div className={styles.body}>{t.body}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
