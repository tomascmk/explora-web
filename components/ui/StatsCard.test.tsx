import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils/render";
import { StatsCard } from "./StatsCard";

describe("StatsCard", () => {
  it("renders label and string value", () => {
    render(<StatsCard label="Revenue" value="N/A" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("formats a numeric value with thousands separators and prefix/suffix", () => {
    render(<StatsCard label="Sales" value={12345} prefix="$" suffix="%" />);
    expect(screen.getByText("$12,345%")).toBeInTheDocument();
  });

  it("renders an icon when provided", () => {
    render(
      <StatsCard
        label="Users"
        value={1}
        icon={<span data-testid="icon">i</span>}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("shows a positive trend with a + sign and trend label", () => {
    render(
      <StatsCard label="Growth" value={10} trend={12.5} trendLabel="vs last month" />,
    );
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("shows a negative trend without a leading + sign", () => {
    render(<StatsCard label="Drop" value={10} trend={-3.2} />);
    expect(screen.getByText("-3.2%")).toBeInTheDocument();
  });

  it("does not render trend block when trend is undefined", () => {
    render(<StatsCard label="None" value={5} />);
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it("applies the variant icon styling", () => {
    render(
      <StatsCard
        label="Success"
        value={1}
        variant="success"
        icon={<span data-testid="icon">i</span>}
      />,
    );
    const wrapper = screen.getByTestId("icon").parentElement;
    expect(wrapper).toHaveStyle({ color: "var(--color-success)" });
  });
});
