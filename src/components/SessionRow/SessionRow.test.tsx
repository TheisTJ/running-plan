import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionRow } from "./SessionRow";
import type { Session } from "../../types";

const session: Session = {
  label: "Session A",
  detail: "Run 5 min → Walk 2 min → Run 5 min",
  totalRun: 10,
};

describe("SessionRow", () => {
  it("renders the label, detail and run total", () => {
    render(
      <SessionRow session={session} done={false} isLast onToggle={() => {}} />,
    );
    expect(screen.getByText("Session A")).toBeInTheDocument();
    expect(screen.getByText(session.detail)).toBeInTheDocument();
    expect(screen.getByText("10 min run")).toBeInTheDocument();
  });

  it("fires onToggle when clicked", async () => {
    const onToggle = vi.fn();
    render(
      <SessionRow session={session} done={false} isLast onToggle={onToggle} />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("reflects the done state via aria-checked", () => {
    render(<SessionRow session={session} done isLast onToggle={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("is toggleable via keyboard", async () => {
    const onToggle = vi.fn();
    render(
      <SessionRow session={session} done={false} isLast onToggle={onToggle} />,
    );
    const row = screen.getByRole("checkbox");
    row.focus();
    await userEvent.keyboard(" ");
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
