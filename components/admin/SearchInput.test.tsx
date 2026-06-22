import { describe, it, expect, vi } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";
import { render, screen, userEvent } from "@/test-utils/render";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders the default placeholder", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders a custom placeholder", () => {
    render(
      <SearchInput value="" onChange={vi.fn()} placeholder="Find users" />,
    );
    expect(screen.getByPlaceholderText("Find users")).toBeInTheDocument();
  });

  it("debounces onChange and eventually fires with the typed value", async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} debounceMs={10} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ab" } });
    // local input updates immediately
    expect(screen.getByRole("textbox")).toHaveValue("ab");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("ab"));
  });

  it("syncs local value when the value prop changes", () => {
    const { rerender } = render(<SearchInput value="x" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("x");
    rerender(<SearchInput value="updated" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("updated");
  });

  it("clears immediately via the clear button", async () => {
    const onChange = vi.fn();
    render(<SearchInput value="hello" onChange={onChange} />);
    const clearBtn = screen.getByRole("button");
    await userEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("does not show the clear button when empty", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
