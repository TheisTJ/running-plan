import { useState } from "react";
import type { SyncStatus } from "../../hooks/useProgress";
import styles from "./SyncSettings.module.css";

interface SyncSettingsProps {
  syncCode: string;
  setSyncCode: (code: string) => void;
  syncStatus: SyncStatus;
}

const STATUS_LABEL: Record<SyncStatus, string> = {
  local: "Saved on this device only",
  syncing: "Syncing…",
  synced: "Synced across your devices",
  offline: "Offline — saved locally, will sync later",
};

export function SyncSettings({
  syncCode,
  setSyncCode,
  syncStatus,
}: SyncSettingsProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — the code is still visible to copy manually.
    }
  };

  const link = () => {
    setSyncCode(draft);
    setDraft("");
  };

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="sync-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.kicker}>Device sync</span>
        <span className={styles.status} data-status={syncStatus}>
          {STATUS_LABEL[syncStatus]}
        </span>
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
        <div id="sync-panel" className={styles.panel}>
          <p className={styles.help}>
            Your progress is tied to this sync code. To track on another device,
            open this site there and paste the same code below.
          </p>

          <label className={styles.label} htmlFor="sync-code">
            Your sync code
          </label>
          <div className={styles.row}>
            <input
              id="sync-code"
              className={styles.input}
              value={syncCode}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
            />
            <button type="button" className={styles.button} onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <label className={styles.label} htmlFor="sync-link">
            Link another device's code
          </label>
          <div className={styles.row}>
            <input
              id="sync-link"
              className={styles.input}
              value={draft}
              placeholder="Paste a sync code…"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="button"
              className={styles.button}
              onClick={link}
              disabled={!draft.trim() || draft.trim() === syncCode}
            >
              Link
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
