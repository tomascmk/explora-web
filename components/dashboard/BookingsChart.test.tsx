import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingsChart } from "./BookingsChart";

// Recharts ResponsiveContainer renders nothing without a measured size in jsdom,
// so stub it to a fixed-size div to let the inner chart mount.
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
  { period: "Jan", count: 10, revenue: 100 },
  { period: "Feb", count: 20, revenue: 200 },
];

describe("BookingsChart", () => {
  it("renders the chart heading", () => {
    render(<BookingsChart data={data} />);
    expect(screen.getByText("Bookings by Period")).toBeInTheDocument();
  });

  it("renders the chart wrapper with a fixed height", () => {
    const { container } = render(<BookingsChart data={data} />);
    // Recharts does not paint an <svg> in jsdom (no layout), so assert the
    // data-driven wrapper mounted instead.
    expect(container.querySelector(".h-\\[200px\\]")).toBeTruthy();
  });

  it("renders with empty data without crashing", () => {
    render(<BookingsChart data={[]} />);
    expect(screen.getByText("Bookings by Period")).toBeInTheDocument();
  });
});
