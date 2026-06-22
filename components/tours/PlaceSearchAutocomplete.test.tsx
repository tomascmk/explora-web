import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import { PlaceSearchAutocomplete } from "./PlaceSearchAutocomplete";
import { SEARCH_PLACES } from "@/graphql/places";

const place = {
  id: "p1",
  name: "Teatro Colón",
  description: "Opera house",
  rate: 4.8,
  address: {
    id: "a1",
    city: "Buenos Aires",
    country: "Argentina",
    latitude: -34.6,
    longitude: -58.38,
  },
  categories: [{ id: "c1", nameEn: "Theatre", nameEs: "Teatro" }],
  media: null,
};

function searchMock(query: string, results: unknown[]) {
  return {
    request: { query: SEARCH_PLACES, variables: { query, limit: 10 } },
    result: { data: { searchPlaces: results } },
  };
}

describe("PlaceSearchAutocomplete", () => {
  it("renders the search input with the default placeholder", () => {
    renderWithProviders(<PlaceSearchAutocomplete onSelect={vi.fn()} />);
    expect(
      screen.getByPlaceholderText(/Search for a place/),
    ).toBeInTheDocument();
  });

  it("does not open the dropdown below the minimum character count", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlaceSearchAutocomplete onSelect={vi.fn()} />);
    await user.type(screen.getByRole("textbox"), "T");
    expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
  });

  it("runs the search and renders results, then selects one", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <PlaceSearchAutocomplete onSelect={onSelect} />,
      { mocks: [searchMock("Teatro", [place])] },
    );

    await user.type(screen.getByRole("textbox"), "Teatro");
    expect(await screen.findByText("Teatro Colón")).toBeInTheDocument();
    expect(screen.getByText(/Buenos Aires, Argentina/)).toBeInTheDocument();
    expect(screen.getByText("Theatre")).toBeInTheDocument();

    await user.click(screen.getByText("Teatro Colón"));
    expect(onSelect).toHaveBeenCalledWith(place);
  });

  it("shows the empty state when there are no results", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PlaceSearchAutocomplete onSelect={vi.fn()} />,
      { mocks: [searchMock("Nowhere", [])] },
    );
    await user.type(screen.getByRole("textbox"), "Nowhere");
    expect(
      await screen.findByText(/No places found/),
    ).toBeInTheDocument();
  });

  it("hides results whose id is in excludedIds", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PlaceSearchAutocomplete onSelect={vi.fn()} excludedIds={["p1"]} />,
      { mocks: [searchMock("Teatro", [place])] },
    );
    await user.type(screen.getByRole("textbox"), "Teatro");
    await waitFor(() =>
      expect(screen.getByText(/No places found/)).toBeInTheDocument(),
    );
    expect(screen.queryByText("Teatro Colón")).not.toBeInTheDocument();
  });
});
