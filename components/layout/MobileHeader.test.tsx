import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, userEvent } from "@/test-utils/render";
import { MobileHeader } from "./MobileHeader";

describe("MobileHeader", () => {
  it("renders the brand name", () => {
    render(<MobileHeader onMenuClick={vi.fn()} />);
    expect(screen.getByText("Explora")).toBeInTheDocument();
  });

  it("calls onMenuClick when the menu button is clicked", async () => {
    const onMenuClick = vi.fn();
    render(<MobileHeader onMenuClick={onMenuClick} />);
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("toggles backgrounds on hover for both buttons", () => {
    render(<MobileHeader onMenuClick={vi.fn()} />);
    const [menuBtn, bellBtn] = screen.getAllByRole("button");
    fireEvent.mouseEnter(menuBtn);
    expect(menuBtn).toHaveStyle({ backgroundColor: "var(--color-section-bg)" });
    fireEvent.mouseLeave(menuBtn);
    expect(menuBtn.style.backgroundColor).toBe("transparent");
    fireEvent.mouseEnter(bellBtn);
    expect(bellBtn).toHaveStyle({ backgroundColor: "var(--color-section-bg)" });
    fireEvent.mouseLeave(bellBtn);
    expect(bellBtn.style.backgroundColor).toBe("transparent");
  });
});
