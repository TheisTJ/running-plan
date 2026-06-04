import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeekCard } from "./WeekCard";
import { weeks } from "../../data/weeks";

const week = weeks[0];

function renderCard(weekCompleted: boolean) {
  const onToggleAll = vi.fn();
  render(
    <WeekCard
      week={week}
      weekIdx={0}
      isDone={() => weekCompleted}
      onToggle={() => {}}
      onToggleAll={onToggleAll}
      weekCompleted={weekCompleted}
    />,
  );
  return { onToggleAll };
}

describe("WeekCard check-all control", () => {
  it("shows 'Check all' when the week is incomplete", () => {
    renderCard(false);
    const btn = screen.getByRole("button", { name: /mark all sessions/i });
    expect(btn).toHaveTextContent("Check all");
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("shows '✓ Complete' when the week is done", () => {
    renderCard(true);
    const btn = screen.getByRole("button", { name: /clear all sessions/i });
    expect(btn).toHaveTextContent("✓ Complete");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("fires onToggleAll when clicked", async () => {
    const { onToggleAll } = renderCard(false);
    await userEvent.click(screen.getByRole("button", { name: /mark all/i }));
    expect(onToggleAll).toHaveBeenCalledOnce();
  });
});
