/** A single training session within a week. */
export interface Session {
  /** Short label, e.g. "Session A". */
  label: string;
  /** Human-readable description of the workout. */
  detail: string;
  /** Total minutes spent running in this session (excludes walk breaks). */
  totalRun: number;
}

/** One week of the plan, containing several sessions. */
export interface Week {
  /** 1-based week number. */
  week: number;
  /** The theme / focus for the week. */
  goal: string;
  sessions: Session[];
}

/** A coaching tip shown in the "key principles" section. */
export interface Tip {
  icon: string;
  title: string;
  body: string;
}
