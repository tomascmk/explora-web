import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import RegisterPage from "./page"

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  const inputs = screen.getAllByRole("textbox")
  await user.type(inputs[0], "john")
  await user.type(inputs[1], "John Doe")
  await user.type(inputs[2], "j@d.com")
  const pw = document.querySelectorAll('input[type="password"]')
  await user.type(pw[0] as HTMLElement, "Password1!")
  await user.type(pw[1] as HTMLElement, "Password1!")
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // PLAN-071 §2A — El bug: la pantalla mandaba `roles: 'GUIDE'`, campo que
  // `RegisterInput` no declara, y la mutation entera fallaba. El registro
  // estaba caido para todos.
  it("no envia `roles` en el payload", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "1" } }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<RegisterPage />)
    await fillForm(user)
    await user.click(screen.getByRole("button", { name: /Create Account/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as { body: string }).body,
    ) as Record<string, unknown>
    expect(body).not.toHaveProperty("roles")
    expect(body).toMatchObject({ username: "john", email: "j@d.com" })
  })

  // El fix ingenuo (sacar `roles` y nada mas) dejaba un callejon sin salida:
  // la API crea TOURIST y el middleware exige GUIDE, asi que /dashboard
  // rebotaba al login sin explicacion.
  it("no navega al portal tras el alta; explica que el acceso de guia es manual", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: "1" } }),
      }),
    )
    const assign = vi.fn()
    Object.defineProperty(window, "location", {
      value: { ...window.location, set href(v: string) { assign(v) } },
      writable: true,
    })

    render(<RegisterPage />)
    await fillForm(user)
    await user.click(screen.getByRole("button", { name: /Create Account/i }))

    await waitFor(() =>
      expect(screen.getByTestId("register-success")).toBeInTheDocument(),
    )
    expect(assign).not.toHaveBeenCalled()
    // PLAN-071 §2C — el estado de éxito ya no es un callejón sin salida:
    // encadena con la solicitud de guía.
    expect(
      screen.getByRole('link', { name: /Solicitar acceso de guía/i }),
    ).toHaveAttribute('href', '/guide-application')
  })

  it("no promete una cuenta de guia automatica", () => {
    render(<RegisterPage />)
    expect(screen.queryByText("Become a Guide")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Create Guide Account" }),
    ).not.toBeInTheDocument()
  })

  it("muestra el error del servidor", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Email taken" }),
      }),
    )

    render(<RegisterPage />)
    await fillForm(user)
    await user.click(screen.getByRole("button", { name: /Create Account/i }))

    await waitFor(() =>
      expect(screen.getByText("Email taken")).toBeInTheDocument(),
    )
  })
})
