import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders, screen, userEvent } from "@/test-utils/render";
import { MobileHeader } from "./MobileHeader";

describe("MobileHeader", () => {
  it("renders the brand name", () => {
    renderWithProviders(<MobileHeader onMenuClick={vi.fn()} onNotificationsClick={vi.fn()} />);
    expect(screen.getByText("Explora")).toBeInTheDocument();
  });

  it("calls onMenuClick when the menu button is clicked", async () => {
    const onMenuClick = vi.fn();
    renderWithProviders(<MobileHeader onMenuClick={onMenuClick} onNotificationsClick={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("toggles backgrounds on hover for both buttons", () => {
    renderWithProviders(<MobileHeader onMenuClick={vi.fn()} onNotificationsClick={vi.fn()} />);
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

  // PLAN-090 — Antes esta campana era decorativa: se renderizaba sin onClick y
  // sin contador, asi que parecia funcional y no hacia nada.
  it("opens the notification center when the bell is clicked", async () => {
    const onNotificationsClick = vi.fn();
    renderWithProviders(
      <MobileHeader onMenuClick={vi.fn()} onNotificationsClick={onNotificationsClick} />,
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    expect(onNotificationsClick).toHaveBeenCalled();
  });
});
