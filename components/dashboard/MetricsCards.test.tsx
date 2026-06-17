import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsCards } from "./MetricsCards";

const baseProps = {
  totalBookings: 1234,
  totalRevenue: 9876.5,
  averageRating: 4.27,
  conversionRate: 0.1234,
  bookingGrowth: 0.12,
  revenueGrowth: -0.05,
};

describe("MetricsCards", () => {
  it("renders the four metric labels", () => {
    render(<MetricsCards {...baseProps} />);
    expect(screen.getByText("Total Bookings")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Average Rating")).toBeInTheDocument();
    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
  });

  it("formats the bookings count with locale separators", () => {
    render(<MetricsCards {...baseProps} />);
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("formats revenue with two decimals and a dollar prefix", () => {
    render(<MetricsCards {...baseProps} />);
    expect(screen.getByText("$9876.50")).toBeInTheDocument();
  });

  it("formats average rating with one decimal", () => {
    render(<MetricsCards {...baseProps} />);
    expect(screen.getByText("4.3")).toBeInTheDocument();
  });

  it("formats conversion rate as a percentage", () => {
    render(<MetricsCards {...baseProps} />);
    // StatsCard concatenates value + suffix in a single node.
    expect(screen.getByText("12.3%")).toBeInTheDocument();
  });

  it("renders positive and negative trend values", () => {
    render(<MetricsCards {...baseProps} />);
    // bookingGrowth 0.12 -> +12.0%
    expect(screen.getByText("+12.0%")).toBeInTheDocument();
    // revenueGrowth -0.05 -> -5.0%
    expect(screen.getByText("-5.0%")).toBeInTheDocument();
  });
});
