import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevenueChart } from "./RevenueChart";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  };
});

const data = [
  { period: "Jan", amount: 100 },
  { period: "Feb", amount: 250 },
];

describe("RevenueChart", () => {
  it("renders the chart heading", () => {
    render(<RevenueChart data={data} />);
    expect(screen.getByText("Revenue Over Time")).toBeInTheDocument();
  });

  it("renders the chart wrapper with a fixed height", () => {
    const { container } = render(<RevenueChart data={data} />);
    expect(container.querySelector(".h-\\[200px\\]")).toBeTruthy();
  });

  it("renders with empty data without crashing", () => {
    render(<RevenueChart data={[]} />);
    expect(screen.getByText("Revenue Over Time")).toBeInTheDocument();
  });
});
