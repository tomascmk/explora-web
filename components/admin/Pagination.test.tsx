import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils/render";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={0}
        onPageChange={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the current range and totals", () => {
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={25}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
  });

  it("disables the previous button on the first page", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={25}
        onPageChange={vi.fn()}
      />,
    );
    const [prev] = screen.getAllByRole("button");
    expect(prev).toBeDisabled();
  });

  it("disables the next button on the last page", () => {
    render(
      <Pagination
        page={3}
        pageSize={10}
        totalCount={25}
        onPageChange={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it("calls onPageChange when navigating", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
      />,
    );
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]); // prev
    expect(onPageChange).toHaveBeenCalledWith(1);
    await userEvent.click(buttons[buttons.length - 1]); // next
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders the page size selector and calls onPageSizeChange", async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={25}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "25");
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it("does not render the page size selector when handler is absent", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={25}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
