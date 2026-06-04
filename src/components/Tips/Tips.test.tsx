import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tips } from "./Tips";
import { tips } from "../../data/tips";

describe("Tips", () => {
  it("is collapsed by default", () => {
    render(<Tips tips={tips} />);
    expect(
      screen.getByRole("button", { name: /key principles/i }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(tips[0].title)).not.toBeInTheDocument();
  });

  it("reveals the tips when the header is clicked", async () => {
    render(<Tips tips={tips} />);
    const toggle = screen.getByRole("button", { name: /key principles/i });

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(tips[0].title)).toBeInTheDocument();
    expect(screen.getByText(tips[0].body)).toBeInTheDocument();
  });

  it("hides the tips again when toggled twice", async () => {
    render(<Tips tips={tips} />);
    const toggle = screen.getByRole("button", { name: /key principles/i });

    await userEvent.click(toggle);
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(tips[0].title)).not.toBeInTheDocument();
  });
});
