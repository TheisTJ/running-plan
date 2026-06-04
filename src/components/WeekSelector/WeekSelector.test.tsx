import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeekSelector } from "./WeekSelector";
import { weeks } from "../../data/weeks";

function setup() {
  const onSelect = vi.fn();
  const onToggleWeek = vi.fn();
  render(
    <WeekSelector
      weeks={weeks}
      activeWeek={0}
      onSelect={onSelect}
      onToggleWeek={onToggleWeek}
      isWeekDone={() => false}
    />,
  );
  return { onSelect, onToggleWeek };
}

describe("WeekSelector", () => {
  it("renders one pill per week", () => {
    setup();
    expect(screen.getByRole("button", { name: /^W1$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^W10$/ })).toBeInTheDocument();
  });

  it("plain click selects the week (not toggle)", async () => {
    const { onSelect, onToggleWeek } = setup();
    await userEvent.click(screen.getByRole("button", { name: /^W3$/ }));
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(onToggleWeek).not.toHaveBeenCalled();
  });

  it("Ctrl+click toggles the week without selecting", () => {
    const { onSelect, onToggleWeek } = setup();
    fireEvent.click(screen.getByRole("button", { name: /^W3$/ }), {
      ctrlKey: true,
    });
    expect(onToggleWeek).toHaveBeenCalledWith(2);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("Cmd/Meta+click toggles the week without selecting", () => {
    const { onSelect, onToggleWeek } = setup();
    fireEvent.click(screen.getByRole("button", { name: /^W5$/ }), {
      metaKey: true,
    });
    expect(onToggleWeek).toHaveBeenCalledWith(4);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
