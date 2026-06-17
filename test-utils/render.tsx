import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockedResponse } from "@apollo/client/testing";

type ProviderOptions = {
  mocks?: readonly MockedResponse[];
} & Omit<RenderOptions, "wrapper">;

/**
 * render() wrapped in Apollo's MockedProvider (Apollo Client v4 ships it from
 * `@apollo/client/testing/react`). next/navigation is mocked globally in
 * vitest.setup.ts.
 */
export function renderWithProviders(
  ui: ReactElement,
  { mocks = [], ...options }: ProviderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
