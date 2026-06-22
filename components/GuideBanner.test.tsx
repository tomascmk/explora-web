import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test-utils/render";
import { ACTIVE_ANNOUNCEMENTS, type Announcement } from "@/graphql/announcements";
import { GuideBanner } from "./GuideBanner";

const useAuthMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

function announcement(over: Partial<Announcement>): Announcement {
  return {
    id: "a1",
    title: "Title",
    message: "Message",
    type: "INFO",
    targetAudience: "ALL",
    isActive: true,
    expiresAt: null,
    createdAt: "",
    updatedAt: "",
    ...over,
  };
}

const makeMock = (announcements: Announcement[]) => ({
  request: { query: ACTIVE_ANNOUNCEMENTS },
  result: { data: { activeAnnouncements: announcements } },
});

describe("GuideBanner", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
  });

  it("renders nothing when there are no announcements", async () => {
    const { container } = renderWithProviders(<GuideBanner />, {
      mocks: [makeMock([])],
    });
    // wait a tick for the query to resolve
    await screen.findByText(() => true).catch(() => null);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders announcement title and message for each type", async () => {
    renderWithProviders(<GuideBanner />, {
      mocks: [
        makeMock([
          announcement({ id: "1", title: "Info!", message: "info body", type: "INFO" }),
          announcement({ id: "2", title: "Warn!", message: "warn body", type: "WARNING" }),
          announcement({ id: "3", title: "Promo!", message: "promo body", type: "PROMOTION" }),
        ]),
      ],
    });
    expect(await screen.findByText("Info!")).toBeInTheDocument();
    expect(screen.getByText("Warn!")).toBeInTheDocument();
    expect(screen.getByText("Promo!")).toBeInTheDocument();
    expect(screen.getByText("info body")).toBeInTheDocument();
  });

  it("dismisses an announcement when its close button is clicked", async () => {
    renderWithProviders(<GuideBanner />, {
      mocks: [makeMock([announcement({ id: "x", title: "Dismiss me" })])],
    });
    expect(await screen.findByText("Dismiss me")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
  });

  it("skips the query and renders nothing when unauthenticated", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    const { container } = renderWithProviders(<GuideBanner />, { mocks: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
