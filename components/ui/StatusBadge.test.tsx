import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("title-cases a simple lowercase status", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("replaces underscores with spaces", () => {
    render(<StatusBadge status="sold_out" />);
    // first letter of each word is uppercased; "out" is not a joining word here
    expect(screen.getByText("Sold Out")).toBeInTheDocument();
  });

  it("applies an extra className alongside the base classes", () => {
    render(<StatusBadge status="active" className="ml-2" />);
    const badge = screen.getByText("Active");
    expect(badge).toHaveClass("ml-2");
    expect(badge).toHaveClass("rounded-full");
  });
});
