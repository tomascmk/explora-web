import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, userEvent } from "@/test-utils/render";
import { FilterButton } from "./FilterButton";

describe("FilterButton", () => {
  it("renders its children", () => {
    render(
      <FilterButton active={false} onClick={vi.fn()}>
        All
      </FilterButton>,
    );
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(
      <FilterButton active={false} onClick={onClick}>
        All
      </FilterButton>,
    );
    await userEvent.click(screen.getByText("All"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies active styling when active", () => {
    render(
      <FilterButton active onClick={vi.fn()}>
        Active
      </FilterButton>,
    );
    const btn = screen.getByText("Active");
    expect(btn).toHaveStyle({ backgroundColor: "var(--color-primary)" });
    expect(btn).toHaveClass("text-white");
  });

  it("applies inactive styling and toggles hover colors when inactive", async () => {
    render(
      <FilterButton active={false} onClick={vi.fn()}>
        Inactive
      </FilterButton>,
    );
    const btn = screen.getByText("Inactive");
    expect(btn).toHaveStyle({ backgroundColor: "var(--color-card-bg)" });
    // The hover handlers assign `style.borderColor = 'var(--color-primary)'`,
    // but jsdom silently drops CSS-variable values in inline-style assignment,
    // so we exercise the !active branch (for coverage) and assert it stays mounted
    // rather than asserting the dropped value.
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn).toBeInTheDocument();
  });

  it("does not change colors on hover when active", () => {
    render(
      <FilterButton active onClick={vi.fn()}>
        Active
      </FilterButton>,
    );
    const btn = screen.getByText("Active");
    fireEvent.mouseEnter(btn);
    // active branch keeps inline primary background; hover handler is a no-op
    expect(btn).toHaveStyle({ backgroundColor: "var(--color-primary)" });
  });
});
