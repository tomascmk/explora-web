import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils/render";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("does not render a subtitle when not provided", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByText("Manage things")).not.toBeInTheDocument();
  });

  it("renders the subtitle when provided", () => {
    render(<PageHeader title="Dashboard" subtitle="Manage things" />);
    expect(screen.getByText("Manage things")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <PageHeader title="Dashboard" actions={<button>New</button>} />,
    );
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });
});
