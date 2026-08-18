import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TourScheduleManager, type TourScheduleRow } from "./TourScheduleManager"

const createMock = vi.fn()
const updateMock = vi.fn()
const removeMock = vi.fn()

vi.mock("@apollo/client/react", () => ({
  useMutation: (doc: { __which?: string }) => {
    const which = (doc as unknown as { __which: string }).__which
    if (which === "create") return [createMock]
    if (which === "update") return [updateMock]
    return [removeMock]
  },
}))

vi.mock("@/graphql/tours", () => ({
  CREATE_TOUR_SCHEDULE: { __which: "create" },
  UPDATE_TOUR_SCHEDULE: { __which: "update" },
  REMOVE_TOUR_SCHEDULE: { __which: "remove" },
}))

const row = (over: Partial<TourScheduleRow> = {}): TourScheduleRow => ({
  id: "sch-1",
  startTime: "2027-03-10T14:00:00.000Z",
  endTime: null,
  isAvailable: true,
  maxCapacity: 10,
  specialInfo: null,
  reservations: [],
  ...over,
})

const onChanged = vi.fn()

const setup = (schedules: TourScheduleRow[] = []) =>
  render(
    <TourScheduleManager
      tourId="tour-1"
      schedules={schedules}
      onChanged={onChanged}
    />,
  )

describe("TourScheduleManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMock.mockResolvedValue({})
    updateMock.mockResolvedValue({})
    removeMock.mockResolvedValue({})
  })

  // Antes el bloque no se renderizaba si no habia horarios, asi que un tour
  // sin sesiones no ofrecia forma de crear la primera.
  it("ofrece crear la primera sesion cuando no hay ninguna", () => {
    setup([])
    expect(screen.getByTestId("schedule-empty")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add session" }),
    ).toBeInTheDocument()
  })

  it("crea una sesion mandando tourId", async () => {
    const user = userEvent.setup()
    setup([])

    await user.type(screen.getByLabelText(/Date/i), "2027-03-10")
    await user.type(screen.getByLabelText(/^Start/i), "14:00")
    await user.type(screen.getByLabelText(/Capacity/i), "8")
    await user.click(screen.getByRole("button", { name: "Add session" }))

    await waitFor(() => expect(createMock).toHaveBeenCalled())
    const input = createMock.mock.calls[0][0].variables.input
    expect(input).toMatchObject({ tourId: "tour-1", maxCapacity: 8 })
    expect(onChanged).toHaveBeenCalled()
  })

  // PLAN-071 §0b: mover un horario a otro tour se lleva sus reservas. El
  // servidor lo rechaza; la UI directamente no debe ofrecerlo.
  it("nunca manda tourId al editar", async () => {
    const user = userEvent.setup()
    setup([row()])

    await user.click(screen.getByRole("button", { name: "Edit" }))
    await user.click(screen.getByRole("button", { name: "Save session" }))

    await waitFor(() => expect(updateMock).toHaveBeenCalled())
    const input = updateMock.mock.calls[0][0].variables.input
    expect(input).toHaveProperty("id", "sch-1")
    expect(input).not.toHaveProperty("tourId")
  })

  it("no intenta borrar una sesion con reservas y explica por que", async () => {
    const user = userEvent.setup()
    setup([row({ reservations: [{ id: "r1" }, { id: "r2" }] })])

    await user.click(screen.getByRole("button", { name: "Delete" }))

    expect(removeMock).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(
      /2 reservation\(s\) and cannot be deleted/i,
    )
  })

  it("borra una sesion sin reservas tras confirmar", async () => {
    const user = userEvent.setup()
    vi.spyOn(window, "confirm").mockReturnValue(true)
    setup([row()])

    await user.click(screen.getByRole("button", { name: "Delete" }))

    await waitFor(() => expect(removeMock).toHaveBeenCalled())
    expect(removeMock.mock.calls[0][0].variables).toEqual({ id: "sch-1" })
  })

  it("no borra si el usuario cancela la confirmacion", async () => {
    const user = userEvent.setup()
    vi.spyOn(window, "confirm").mockReturnValue(false)
    setup([row()])

    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(removeMock).not.toHaveBeenCalled()
  })

  it("valida que la hora de fin sea posterior a la de inicio", async () => {
    const user = userEvent.setup()
    setup([])

    await user.type(screen.getByLabelText(/Date/i), "2027-03-10")
    await user.type(screen.getByLabelText(/^Start/i), "14:00")
    await user.type(screen.getByLabelText(/End/i), "13:00")
    await user.click(screen.getByRole("button", { name: "Add session" }))

    expect(createMock).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(/after the start time/i)
  })

  it("muestra el error del servidor y no limpia el formulario", async () => {
    const user = userEvent.setup()
    createMock.mockRejectedValue(new Error("You can only modify schedules of your own tours"))
    setup([])

    await user.type(screen.getByLabelText(/Date/i), "2027-03-10")
    await user.type(screen.getByLabelText(/^Start/i), "14:00")
    await user.click(screen.getByRole("button", { name: "Add session" }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /your own tours/i,
      ),
    )
    expect(onChanged).not.toHaveBeenCalled()
  })

  it("muestra las plazas reservadas sobre el cupo", () => {
    setup([row({ maxCapacity: 10, reservations: [{ id: "r1" }] })])
    expect(screen.getByText(/1\/10 booked/)).toBeInTheDocument()
  })
})
