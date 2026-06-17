import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TutorialTooltip } from "./TutorialTooltip";

const steps = [
  { target: "#a", title: "Step One", content: "First", placement: "bottom" as const },
  { target: "#b", title: "Step Two", content: "Second", placement: "top" as const },
];

beforeEach(() => {
  localStorage.clear();
  // Target elements the tooltip positions itself against.
  document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("TutorialTooltip", () => {
  it("shows the first step after the open delay", async () => {
    render(<TutorialTooltip steps={steps} tutorialKey="t1" />);
    expect(screen.queryByText("Step One")).not.toBeInTheDocument();
    expect(await screen.findByText("Step One")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("advances to the next step and completes on the last", async () => {
    const user = userEvent.setup();
    render(<TutorialTooltip steps={steps} tutorialKey="t1" />);
    await screen.findByText("Step One");

    await user.click(screen.getByText("Siguiente"));
    expect(screen.getByText("Step Two")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    await user.click(screen.getByText("Finalizar"));
    await waitFor(() =>
      expect(screen.queryByText("Step Two")).not.toBeInTheDocument(),
    );
    expect(localStorage.getItem("tutorial_t1_completed")).toBe("true");
  });

  it("skips the tutorial and marks it completed", async () => {
    const user = userEvent.setup();
    render(<TutorialTooltip steps={steps} tutorialKey="t1" />);
    await screen.findByText("Step One");

    await user.click(screen.getByText("Saltar"));
    await waitFor(() =>
      expect(screen.queryByText("Step One")).not.toBeInTheDocument(),
    );
    expect(localStorage.getItem("tutorial_t1_completed")).toBe("true");
  });

  it("closes via the X button", async () => {
    const user = userEvent.setup();
    render(<TutorialTooltip steps={steps} tutorialKey="t1" />);
    await screen.findByText("Step One");

    // The X button has no accessible text; it is the first button in the card.
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    await waitFor(() =>
      expect(screen.queryByText("Step One")).not.toBeInTheDocument(),
    );
    expect(localStorage.getItem("tutorial_t1_completed")).toBe("true");
  });

  it("does not show when already completed", async () => {
    localStorage.setItem("tutorial_t1_completed", "true");
    render(<TutorialTooltip steps={steps} tutorialKey="t1" />);
    // Give the open timer time to (not) fire.
    await new Promise((r) => setTimeout(r, 700));
    expect(screen.queryByText("Step One")).not.toBeInTheDocument();
  });

  it("does nothing with an empty steps list", async () => {
    render(<TutorialTooltip steps={[]} tutorialKey="empty" />);
    await new Promise((r) => setTimeout(r, 700));
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
