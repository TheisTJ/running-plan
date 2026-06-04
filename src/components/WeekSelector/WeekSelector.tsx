import type { Week } from "../../types";
import styles from "./WeekSelector.module.css";

interface WeekSelectorProps {
  weeks: Week[];
  activeWeek: number;
  onSelect: (weekIdx: number) => void;
  onToggleWeek: (weekIdx: number) => void;
  isWeekDone: (weekIdx: number) => boolean;
}

export function WeekSelector({
  weeks,
  activeWeek,
  onSelect,
  onToggleWeek,
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
            title="Click to view · Ctrl/Cmd+click to toggle the whole week"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                onToggleWeek(i);
              } else {
                onSelect(i);
              }
            }}
          >
            {done ? "✓ " : ""}W{i + 1}
          </button>
        );
      })}
    </div>
  );
}
