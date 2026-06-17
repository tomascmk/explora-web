import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, userEvent } from "@/test-utils/render";
import { AdminMobileHeader } from "./AdminMobileHeader";

describe("AdminMobileHeader", () => {
  it("renders the brand and Admin tag", () => {
    render(<AdminMobileHeader onMenuClick={vi.fn()} />);
    expect(screen.getByText("Explora")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("calls onMenuClick when the menu button is clicked", async () => {
    const onMenuClick = vi.fn();
    render(<AdminMobileHeader onMenuClick={onMenuClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("toggles the menu button background on hover", () => {
    render(<AdminMobileHeader onMenuClick={vi.fn()} />);
    const btn = screen.getByRole("button");
    fireEvent.mouseEnter(btn);
    expect(btn).toHaveStyle({ backgroundColor: "var(--color-section-bg)" });
    fireEvent.mouseLeave(btn);
    expect(btn.style.backgroundColor).toBe("transparent");
  });
});
