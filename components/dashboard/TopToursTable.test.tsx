import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopToursTable } from "./TopToursTable";

const tours = [
  { tourId: "1", tourTitle: "City Walk", bookings: 12, revenue: 340.5 },
  { tourId: "2", tourTitle: "Food Tour", bookings: 8, revenue: 199 },
];

describe("TopToursTable", () => {
  it("renders the section heading", () => {
    render(<TopToursTable tours={tours} />);
    expect(screen.getByText("Top Tours")).toBeInTheDocument();
  });

  it("renders a row per tour with title, bookings and formatted revenue", () => {
    render(<TopToursTable tours={tours} />);
    expect(screen.getByText("City Walk")).toBeInTheDocument();
    expect(screen.getByText("Food Tour")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("$340.50")).toBeInTheDocument();
    expect(screen.getByText("$199.00")).toBeInTheDocument();
  });

  it("shows the empty message when there are no tours", () => {
    render(<TopToursTable tours={[]} />);
    expect(screen.getByText("No tour data available yet")).toBeInTheDocument();
  });
});
