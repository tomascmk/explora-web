import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./Calendar";

// Pin "today" so month navigation and labels are deterministic.
const TODAY = new Date(2026, 5, 15); // 15 Jun 2026 (month index 5)

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Calendar", () => {
  it("renders the current month header and weekday labels", () => {
    render(<Calendar events={[]} onDateClick={vi.fn()} />);
    expect(screen.getByText("June 2026")).toBeInTheDocument();
    expect(screen.getByText("Dom")).toBeInTheDocument();
    expect(screen.getByText("Sáb")).toBeInTheDocument();
  });

  it("navigates to the previous and next month", async () => {
    const user = userEvent.setup();
    const { container } = render(<Calendar events={[]} onDateClick={vi.fn()} />);
    const buttons = container.querySelectorAll("button.p-2");

    await user.click(buttons[0]); // previous
    expect(screen.getByText("May 2026")).toBeInTheDocument();

    await user.click(buttons[1]); // next -> back to June
    expect(screen.getByText("June 2026")).toBeInTheDocument();

    await user.click(buttons[1]); // next -> July
    expect(screen.getByText("July 2026")).toBeInTheDocument();
  });

  it("calls onDateClick with the clicked day on a single click", async () => {
    const user = userEvent.setup();
    const onDateClick = vi.fn();
    render(<Calendar events={[]} onDateClick={onDateClick} />);

    await user.click(screen.getByText("10"));
    expect(onDateClick).toHaveBeenCalledTimes(1);
    expect(onDateClick.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it("calls onCreateEvent on a fast double click", async () => {
    const user = userEvent.setup();
    const onCreateEvent = vi.fn();
    render(
      <Calendar
        events={[]}
        onDateClick={vi.fn()}
        onCreateEvent={onCreateEvent}
      />,
    );

    const day = screen.getByText("12");
    await user.click(day);
    await user.click(day); // within the 300ms threshold (advanced timers)
    expect(onCreateEvent).toHaveBeenCalledTimes(1);
  });

  it("renders event indicators and a +N overflow badge", () => {
    const day = new Date(2026, 5, 20);
    const events = [
      { id: "a", date: day, title: "A", type: "availability" as const },
      { id: "b", date: day, title: "B", type: "reservation" as const },
      { id: "c", date: day, title: "C", type: "reservation" as const },
    ];
    render(<Calendar events={events} onDateClick={vi.fn()} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("highlights the selected date", () => {
    const selectedDate = new Date(2026, 5, 18);
    render(
      <Calendar
        events={[]}
        onDateClick={vi.fn()}
        selectedDate={selectedDate}
      />,
    );
    expect(screen.getByText("18")).toBeInTheDocument();
  });
});
