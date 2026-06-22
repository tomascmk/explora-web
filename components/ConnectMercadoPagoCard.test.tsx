import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test-utils/render";
import {
  MY_CONNECTED_ACCOUNT,
  CONNECT_MERCADOPAGO,
  DISCONNECT_MERCADOPAGO,
} from "@/graphql/connected-accounts";
import { ConnectMercadoPagoCard } from "./ConnectMercadoPagoCard";

const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

function accountMock(status: string | null) {
  return {
    request: { query: MY_CONNECTED_ACCOUNT },
    result: {
      data: {
        myConnectedAccount: status
          ? {
              id: "acc1",
              provider: "mercadopago",
              providerUserId: "u1",
              status,
              createdAt: "",
              updatedAt: "",
            }
          : null,
      },
    },
  };
}

describe("ConnectMercadoPagoCard", () => {
  beforeEach(() => {
    toastError.mockClear();
    toastSuccess.mockClear();
  });

  it("shows the loading skeleton initially", () => {
    const { container } = renderWithProviders(<ConnectMercadoPagoCard />, {
      mocks: [accountMock(null)],
    });
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders the connect CTA when no account is connected", async () => {
    renderWithProviders(<ConnectMercadoPagoCard />, {
      mocks: [accountMock(null)],
    });
    expect(
      await screen.findByText("Conectá tu cuenta de MercadoPago"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Conectar MercadoPago/ }),
    ).toBeInTheDocument();
  });

  it("renders the connected state and a disconnect button", async () => {
    renderWithProviders(<ConnectMercadoPagoCard />, {
      mocks: [accountMock("connected")],
    });
    expect(await screen.findByText("MercadoPago conectado")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Desconectar/ }),
    ).toBeInTheDocument();
  });

  it("redirects the browser to the authorization URL on connect", async () => {
    const connectMock = {
      request: { query: CONNECT_MERCADOPAGO },
      result: {
        data: {
          connectMercadoPago: { authorizationUrl: "https://auth.example/go" },
        },
      },
    };
    const original = window.location;
    // jsdom location is read-only; replace with a writable stub.
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { href: "" },
    });

    renderWithProviders(<ConnectMercadoPagoCard />, {
      mocks: [accountMock(null), connectMock],
    });
    const btn = await screen.findByRole("button", {
      name: /Conectar MercadoPago/,
    });
    await userEvent.click(btn);
    await vi.waitFor(() =>
      expect(window.location.href).toBe("https://auth.example/go"),
    );

    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: original,
    });
  });

  it("opens the confirm modal and disconnects on confirm", async () => {
    const disconnectMock = {
      request: { query: DISCONNECT_MERCADOPAGO },
      result: {
        data: {
          disconnectMercadoPago: { id: "acc1", status: "revoked" },
        },
      },
    };
    renderWithProviders(<ConnectMercadoPagoCard />, {
      mocks: [accountMock("connected"), disconnectMock],
    });
    await userEvent.click(
      await screen.findByRole("button", { name: /Desconectar/ }),
    );
    // ConfirmModal opens with its own confirm action
    expect(
      await screen.findByText("Desconectar MercadoPago"),
    ).toBeInTheDocument();
    const confirmButtons = screen.getAllByRole("button", {
      name: /Desconectar/,
    });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    await vi.waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith(
        "Cuenta de MercadoPago desconectada.",
      ),
    );
  });

  it("does not run the query when disabled", () => {
    const { container } = renderWithProviders(
      <ConnectMercadoPagoCard enabled={false} />,
      { mocks: [] },
    );
    // skip:true -> not loading -> renders the card body directly (connect CTA)
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
    expect(
      screen.getByText("Conectá tu cuenta de MercadoPago"),
    ).toBeInTheDocument();
  });
});
