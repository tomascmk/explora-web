import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getApolloClient = vi.fn();

vi.mock("@/lib/apollo/client", () => ({
  getApolloClient: () => getApolloClient(),
}));

// ApolloProvider just needs to render children; stub it to avoid a real client.
vi.mock("@apollo/client/react", () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="provider">{children}</div>
  ),
}));

import { ApolloWrapper } from "./ApolloWrapper";

describe("ApolloWrapper", () => {
  beforeEach(() => {
    getApolloClient.mockReset();
  });

  it("renders children without a provider when no client is available", () => {
    getApolloClient.mockReturnValue(null);
    render(
      <ApolloWrapper>
        <span>content</span>
      </ApolloWrapper>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.queryByTestId("provider")).not.toBeInTheDocument();
  });

  it("wraps children in ApolloProvider when a client exists", () => {
    getApolloClient.mockReturnValue({ fake: "client" });
    render(
      <ApolloWrapper>
        <span>content</span>
      </ApolloWrapper>,
    );
    expect(screen.getByTestId("provider")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
