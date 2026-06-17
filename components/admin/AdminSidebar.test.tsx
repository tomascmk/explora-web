import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent } from "@/test-utils/render";
import { AdminSidebar } from "./AdminSidebar";

const logout = vi.fn();
const useAuthMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("AdminSidebar", () => {
  beforeEach(() => {
    logout.mockClear();
    useAuthMock.mockReturnValue({
      user: {
        id: "1",
        username: "admin",
        fullName: "Admin User",
        roles: ["ADMIN"],
      },
      logout,
    });
  });

  it("renders all navigation items", () => {
    render(<AdminSidebar isOpen={false} onClose={vi.fn()} />);
    // desktop sidebar always renders; labels appear (duplicated only when open)
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Users").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Moderation").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
  });

  it("renders the admin role badge derived from the user roles", () => {
    render(<AdminSidebar isOpen={false} onClose={vi.fn()} />);
    expect(screen.getAllByText("ADMIN").length).toBeGreaterThan(0);
  });

  it("shows the SUPER ADMIN badge label for super admins", () => {
    useAuthMock.mockReturnValue({
      user: { id: "1", username: "su", roles: ["SUPER_ADMIN"] },
      logout,
    });
    render(<AdminSidebar isOpen={false} onClose={vi.fn()} />);
    expect(screen.getAllByText("SUPER ADMIN").length).toBeGreaterThan(0);
  });

  it("renders the user info block with the initial", () => {
    render(<AdminSidebar isOpen={false} onClose={vi.fn()} />);
    expect(screen.getAllByText("Admin User").length).toBeGreaterThan(0);
    expect(screen.getAllByText("A").length).toBeGreaterThan(0);
  });

  it("calls logout when the logout button is clicked", async () => {
    render(<AdminSidebar isOpen={false} onClose={vi.fn()} />);
    await userEvent.click(screen.getAllByText("Logout")[0]);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("renders the mobile overlay only when open and closes on backdrop click", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <AdminSidebar isOpen onClose={onClose} />,
    );
    const backdrop = container.querySelector(".sidebar-overlay")!;
    expect(backdrop).toBeInTheDocument();
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render the mobile overlay when closed", () => {
    const { container } = render(
      <AdminSidebar isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.querySelector(".sidebar-overlay")).not.toBeInTheDocument();
  });

  it("defaults to ADMIN role badge when user has no admin role", () => {
    useAuthMock.mockReturnValue({
      user: { id: "1", username: "u", roles: ["GUIDE"] },
      logout,
    });
    render(<AdminSidebar isOpen={false} onClose={vi.fn()} />);
    expect(screen.getAllByText("ADMIN").length).toBeGreaterThan(0);
  });
});
