import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test-utils/render";
import { MY_UNREAD_CHAT_COUNT } from "@/graphql/chat";
import { Sidebar } from "./Sidebar";

const logout = vi.fn();
const useAuthMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const FLAGS_ALL_ON = {
  tourCreationEnabled: true,
  discountGroupsEnabled: true,
  claimsEnabled: true,
  reviewsEnabled: true,
  selfGuidedToursEnabled: true,
  inPersonToursEnabled: true,
  chatEnabled: true,
};

const unreadMock = {
  request: { query: MY_UNREAD_CHAT_COUNT },
  result: { data: { myUnreadChatCount: 4 } },
};

describe("Sidebar", () => {
  beforeEach(() => {
    logout.mockClear();
    useAuthMock.mockReturnValue({
      user: { id: "1", username: "guide", fullName: "Guide One", roles: ["GUIDE"] },
      logout,
      featureFlags: FLAGS_ALL_ON,
    });
  });

  it("renders core navigation items", () => {
    renderWithProviders(<Sidebar isOpen={false} onClose={vi.fn()} />, {
      mocks: [unreadMock],
    });
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tours").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
  });

  it("shows flag-gated items when their flags are on", () => {
    renderWithProviders(<Sidebar isOpen={false} onClose={vi.fn()} />, {
      mocks: [unreadMock],
    });
    expect(screen.getAllByText("Messages").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Claims").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Discounts").length).toBeGreaterThan(0);
  });

  it("hides flag-gated items when their flags are off", () => {
    useAuthMock.mockReturnValue({
      user: { id: "1", username: "guide", roles: ["GUIDE"] },
      logout,
      featureFlags: { ...FLAGS_ALL_ON, chatEnabled: false, claimsEnabled: false },
    });
    renderWithProviders(<Sidebar isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Messages")).not.toBeInTheDocument();
    expect(screen.queryByText("Claims")).not.toBeInTheDocument();
  });

  it("renders the unread chat badge from the query", async () => {
    renderWithProviders(<Sidebar isOpen={false} onClose={vi.fn()} />, {
      mocks: [unreadMock],
    });
    expect(await screen.findAllByText("4")).not.toHaveLength(0);
  });

  it("calls logout when the logout button is clicked", async () => {
    renderWithProviders(<Sidebar isOpen={false} onClose={vi.fn()} />, {
      mocks: [unreadMock],
    });
    await userEvent.click(screen.getByText("Logout"));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("renders the user info block with the fullName initial", () => {
    renderWithProviders(<Sidebar isOpen={false} onClose={vi.fn()} />, {
      mocks: [unreadMock],
    });
    expect(screen.getByText("Guide One")).toBeInTheDocument();
  });

  it("closes the mobile overlay on backdrop click when open", async () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <Sidebar isOpen onClose={onClose} />,
      { mocks: [unreadMock] },
    );
    const backdrop = container.querySelector(".sidebar-overlay")!;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
