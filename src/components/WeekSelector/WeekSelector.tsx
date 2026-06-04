import type { Week } from "../../types";
import styles from "./WeekSelector.module.css";

interface WeekSelectorProps {
  weeks: Week[];
  activeWeek: number;
  onSelect: (weekIdx: number) => void;
  isWeekDone: (weekIdx: number) => boolean;
}

export function WeekSelector({
  weeks,
  activeWeek,
  onSelect,
  isWeekDone,
}: WeekSelectorProps) {
  return (
    <div className={styles.selector}>
      {weeks.map((_, i) => {
        const done = isWeekDone(i);
        const active = i === activeWeek;
        const className = [
          styles.pill,
          active ? styles.active : "",
          !active && done ? styles.done : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={i}
            className={className}
            aria-pressed={active}
            onClick={() => onSelect(i)}
          >
            {done ? "✓ " : ""}W{i + 1}
          </button>
        );
      })}
    </div>
  );
}
