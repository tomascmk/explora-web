import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils/render";
import { UserRoleBadge } from "./UserRoleBadge";

describe("UserRoleBadge", () => {
  it("renders the friendly label for a known role", () => {
    render(<UserRoleBadge role="SUPER_ADMIN" />);
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
  });

  it("renders each known role label", () => {
    const roles: Array<[string, string]> = [
      ["ADMIN", "Admin"],
      ["SUPPORT", "Support"],
      ["GUIDE", "Guide"],
      ["TOURIST", "Tourist"],
    ];
    for (const [role, label] of roles) {
      const { unmount } = render(<UserRoleBadge role={role} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("falls back to the raw role for an unknown value", () => {
    render(<UserRoleBadge role="MYSTERY" />);
    expect(screen.getByText("MYSTERY")).toBeInTheDocument();
  });

  it("applies small sizing classes by default", () => {
    render(<UserRoleBadge role="ADMIN" />);
    expect(screen.getByText("Admin")).toHaveClass("text-xs");
  });

  it("applies medium sizing classes when size=md", () => {
    render(<UserRoleBadge role="ADMIN" size="md" />);
    expect(screen.getByText("Admin")).toHaveClass("text-sm");
  });
});
