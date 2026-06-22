import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import { NotificationCenter } from "./NotificationCenter";
import {
  GET_MY_NOTIFICATIONS,
  MARK_AS_READ,
  MARK_ALL_AS_READ,
} from "@/graphql/notifications";

const notifications = [
  {
    id: "1",
    type: "booking",
    title: "New booking",
    body: "You have a new booking",
    data: null,
    read: false,
    channels: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "system",
    title: "Welcome",
    body: "Welcome aboard",
    data: null,
    read: true,
    channels: null,
    createdAt: new Date().toISOString(),
  },
];

function listMock(data: typeof notifications) {
  return {
    request: {
      query: GET_MY_NOTIFICATIONS,
      variables: { limit: 20, offset: 0 },
    },
    result: { data: { myNotifications: data } },
  };
}

describe("NotificationCenter", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithProviders(
      <NotificationCenter isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders fetched notifications when open", async () => {
    renderWithProviders(
      <NotificationCenter isOpen onClose={vi.fn()} />,
      { mocks: [listMock(notifications)] },
    );
    expect(await screen.findByText("New booking")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Mark all as read")).toBeInTheDocument();
  });

  it("shows the empty state when there are no notifications", async () => {
    renderWithProviders(
      <NotificationCenter isOpen onClose={vi.fn()} />,
      { mocks: [listMock([])] },
    );
    expect(await screen.findByText("No notifications")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <NotificationCenter isOpen onClose={onClose} />,
      { mocks: [listMock([])] },
    );
    await screen.findByText("No notifications");
    // The header close button is the second button (after none, before list).
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });

  it("marks a single unread notification as read on click", async () => {
    const markRead = {
      request: { query: MARK_AS_READ, variables: { id: "1" } },
      result: { data: { markNotificationAsRead: { id: "1", read: true } } },
    };
    const user = userEvent.setup();
    renderWithProviders(
      <NotificationCenter isOpen onClose={vi.fn()} />,
      { mocks: [listMock(notifications), markRead, listMock(notifications)] },
    );
    await user.click(await screen.findByText("New booking"));
    await waitFor(() => expect(markRead.result).toBeTruthy());
  });

  it("triggers mark all as read", async () => {
    const markAll = {
      request: { query: MARK_ALL_AS_READ },
      result: { data: { markAllNotificationsAsRead: true } },
    };
    const user = userEvent.setup();
    renderWithProviders(
      <NotificationCenter isOpen onClose={vi.fn()} />,
      { mocks: [listMock(notifications), markAll, listMock(notifications)] },
    );
    await user.click(await screen.findByText("Mark all as read"));
    await waitFor(() => expect(markAll.result).toBeTruthy());
  });
});
