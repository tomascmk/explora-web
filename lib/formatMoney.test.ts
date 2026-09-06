import { describe, it, expect } from "vitest"
import { formatMoney, sumByCurrency } from "./formatMoney"

describe("formatMoney", () => {
  // No se compara contra el texto exacto: `Intl` depende del ICU del motor y
  // agrupa distinto según el entorno. Lo que importa es que una moneda no salga
  // anunciada como otra.
  it("nunca rotula una moneda con el signo de otra", () => {
    expect(formatMoney(300, "EUR")).not.toContain("$")
    expect(formatMoney(45000, "ARS")).not.toMatch(/^\$/)
    expect(formatMoney(45, "USD")).toMatch(/\$|USD/)
  })

  it("sin moneda muestra sólo el número", () => {
    // El calculador de ganancias del portal público no tiene moneda: escribir
    // `$` ahí es afirmar algo que no sabemos.
    expect(formatMoney(500, undefined)).toBe("500")
    expect(formatMoney(500, null)).toBe("500")
    expect(formatMoney(500, "  ")).toBe("500")
  })

  it("normaliza el código en minúsculas", () => {
    // `TourPricing.currency` no tiene constraint de case; 'eur' es el mismo euro.
    expect(formatMoney(300, "eur")).toBe(formatMoney(300, "EUR"))
  })

  it("no explota con un código inexistente", () => {
    expect(() => formatMoney(10, "ZZZ")).not.toThrow()
    expect(formatMoney(10, "ZZZ")).toContain("10")
  })
})

describe("sumByCurrency", () => {
  it("no mezcla monedas distintas en un solo número", () => {
    // El bug: `reduce((s, b) => s + b.amount, 0)` daba 45300 y lo rotulaba `$`.
    const out = sumByCurrency([
      { amount: 45000, currency: "ARS" },
      { amount: 300, currency: "EUR" },
    ])

    expect(out).toEqual([
      { currency: "ARS", amount: 45000 },
      { currency: "EUR", amount: 300 },
    ])
  })

  it("suma lo que sí comparte moneda", () => {
    const out = sumByCurrency([
      { amount: 100.1, currency: "usd" },
      { amount: 200.2, currency: "USD" },
    ])

    // Y redondea: 100.1 + 200.2 en floats da 300.29999999999995.
    expect(out).toEqual([{ currency: "USD", amount: 300.3 }])
  })

  it("deja afuera los ceros y lo que no es un número", () => {
    // Una reserva gratis no agrega una línea "USD 0" al resumen.
    const out = sumByCurrency([
      { amount: 0, currency: "USD" },
      { amount: Number.NaN, currency: "EUR" },
      { amount: -50, currency: "BRL" },
      { amount: 10, currency: "USD" },
    ])

    expect(out).toEqual([{ currency: "USD", amount: 10 }])
  })

  it("ordena por monto y desempata por código", () => {
    const out = sumByCurrency([
      { amount: 10, currency: "USD" },
      { amount: 100, currency: "EUR" },
      { amount: 10, currency: "ARS" },
    ])

    expect(out.map((e) => e.currency)).toEqual(["EUR", "ARS", "USD"])
  })

  it("un pago sin moneda no se pierde", () => {
    // `Payment.currency` es NOT NULL en el esquema, pero un caché viejo puede
    // no traerla. Perder el monto sería peor que asumir la moneda por defecto.
    const out = sumByCurrency([{ amount: 25, currency: null }])

    expect(out).toEqual([{ currency: "USD", amount: 25 }])
  })
})
