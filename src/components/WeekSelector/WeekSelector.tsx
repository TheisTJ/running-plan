import { useEffect, useRef } from "react";
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
  // Keep the active pill in view — the start week can auto-jump to a later
  // week that sits off-screen in the horizontal pill row.
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ inline: "center", block: "nearest" });
  }, [activeWeek]);

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
            ref={active ? activeRef : undefined}
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
