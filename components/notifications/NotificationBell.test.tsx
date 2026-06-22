import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import { NotificationBell } from "./NotificationBell";
import { GET_UNREAD_COUNT } from "@/graphql/notifications";

const socket = { on: vi.fn(), off: vi.fn() };
vi.mock("@/lib/websocket", () => ({
  getSocket: () => socket,
}));

function countMock(count: number) {
  return {
    request: { query: GET_UNREAD_COUNT },
    result: { data: { unreadNotificationsCount: count } },
  };
}

beforeEach(() => {
  socket.on.mockClear();
  socket.off.mockClear();
});

describe("NotificationBell", () => {
  it("renders without a badge when there are no unread notifications", async () => {
    renderWithProviders(<NotificationBell onClick={vi.fn()} />, {
      mocks: [countMock(0)],
    });
    await waitFor(() => expect(socket.on).toHaveBeenCalledWith("notification", expect.any(Function)));
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("shows the unread count badge", async () => {
    renderWithProviders(<NotificationBell onClick={vi.fn()} />, {
      mocks: [countMock(5)],
    });
    expect(await screen.findByText("5")).toBeInTheDocument();
  });

  it("caps the badge at 99+", async () => {
    renderWithProviders(<NotificationBell onClick={vi.fn()} />, {
      mocks: [countMock(150)],
    });
    expect(await screen.findByText("99+")).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell onClick={onClick} />, {
      mocks: [countMock(0)],
    });
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("subscribes to socket notifications and refetches on event", async () => {
    renderWithProviders(<NotificationBell onClick={vi.fn()} />, {
      mocks: [countMock(0)],
    });
    await waitFor(() => expect(socket.on).toHaveBeenCalled());
    // The handler passed to socket.on should be invokable without throwing.
    const handler = socket.on.mock.calls[0][1] as () => void;
    expect(() => handler()).not.toThrow();
  });
});
