import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardTour } from "./DashboardTour";

beforeEach(() => {
  localStorage.clear();
});

describe("DashboardTour", () => {
  it("renders the first dashboard step after the open delay", async () => {
    render(<DashboardTour />);
    expect(await screen.findByText("Métricas Principales")).toBeInTheDocument();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("does not render once the dashboard tutorial is completed", async () => {
    localStorage.setItem("tutorial_dashboard_completed", "true");
    render(<DashboardTour />);
    await new Promise((r) => setTimeout(r, 700));
    expect(screen.queryByText("Métricas Principales")).not.toBeInTheDocument();
  });
});
