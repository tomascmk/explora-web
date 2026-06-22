import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, userEvent } from "@/test-utils/render";
import { BulkActionBar } from "./BulkActionBar";

describe("BulkActionBar", () => {
  it("renders nothing when nothing is selected", () => {
    const { container } = render(
      <BulkActionBar selectedCount={0} onClear={vi.fn()}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the selected count and children actions", () => {
    render(
      <BulkActionBar selectedCount={3} onClear={vi.fn()}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onClear when the close button is clicked", async () => {
    const onClear = vi.fn();
    render(
      <BulkActionBar selectedCount={2} onClear={onClear}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    // the close (X) button is the last button rendered
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[buttons.length - 1]);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("toggles close button background on hover", () => {
    render(
      <BulkActionBar selectedCount={1} onClear={vi.fn()}>
        <button>Delete</button>
      </BulkActionBar>,
    );
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons[buttons.length - 1];
    fireEvent.mouseEnter(closeBtn);
    expect(closeBtn).toHaveStyle({ backgroundColor: "var(--color-section-bg)" });
    fireEvent.mouseLeave(closeBtn);
    expect(closeBtn.style.backgroundColor).toBe("transparent");
  });
});
