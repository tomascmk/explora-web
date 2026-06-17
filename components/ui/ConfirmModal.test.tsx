import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils/render";
import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
  it("does not render content when closed", () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        description="Are you sure?"
      />,
    );
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("renders title, description and default button labels when open", () => {
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete item"
        description="This cannot be undone"
      />,
    );
    expect(screen.getByText("Delete item")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("uses custom confirm and cancel labels", () => {
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="t"
        description="d"
        confirmText="Yes, do it"
        cancelText="No thanks"
      />,
    );
    expect(screen.getByText("Yes, do it")).toBeInTheDocument();
    expect(screen.getByText("No thanks")).toBeInTheDocument();
  });

  it("calls onConfirm and onClose on button clicks", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="t"
        description="d"
      />,
    );
    await userEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons and shows a spinner when loading", () => {
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="t"
        description="d"
        loading
      />,
    );
    expect(screen.getByText("Cancel")).toBeDisabled();
    expect(screen.getByText("Confirm").closest("button")).toBeDisabled();
  });

  it("applies danger variant styling on the confirm button", () => {
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="t"
        description="d"
        variant="danger"
      />,
    );
    const confirm = screen.getByText("Confirm").closest("button");
    expect(confirm).toHaveStyle({ backgroundColor: "var(--color-danger)" });
  });
});
