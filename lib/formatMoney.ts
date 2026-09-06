/**
 * PLAN-122 — Formatea un monto en una moneda.
 *
 * El portal escribía `$` a mano sobre montos que no siempre son dólares, así
 * que un tour en euros salía anunciado como si fuera en dólares — y en la lista
 * de tours el rótulo decía las dos cosas a la vez: `EUR $45`.
 *
 * `Intl` resuelve el símbolo desde el código ISO, así que no puede anunciar una
 * moneda como otra. `currency` acepta vacío a propósito: sin moneda va sólo el
 * número, porque inventarle un símbolo es el mismo bug sin un dato del que
 * culpar.
 *
 * Gemelo de `utils/formatMoney.ts` en explora-app. No se comparte código entre
 * repos: son dos deploys distintos y no hay paquete común.
 */
export function formatMoney(amount: number, currency?: string | null): string {
  const code = currency?.trim().toUpperCase();
  if (!code) return String(Math.round(amount * 100) / 100);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const rounded = Math.round(amount * 100) / 100;
    return `${code} ${rounded.toLocaleString()}`;
  }
}

/**
 * Agrupa montos por moneda. Sumar monedas distintas da un número que no
 * significa nada en ninguna: 45.000 pesos + 300 euros no son 45.300 de nada.
 * Es el mismo agujero que PLAN-119 cerró del lado del servidor.
 *
 * Devuelve las monedas ordenadas por monto descendente, sin los ceros: una
 * reserva gratis no agrega una línea "USD 0".
 */
export function sumByCurrency(
  entries: { amount: number; currency?: string | null }[],
): { currency: string; amount: number }[] {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    const amount = Number(entry.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const code = entry.currency?.trim().toUpperCase() || 'USD';
    totals.set(code, (totals.get(code) ?? 0) + amount);
  }
  return [...totals.entries()]
    .map(([currency, amount]) => ({
      currency,
      // Sumar floats arrastra basura (0.1 + 0.2); los montos tienen 2 decimales.
      amount: Math.round(amount * 100) / 100,
    }))
    .sort((a, b) => b.amount - a.amount || a.currency.localeCompare(b.currency));
}
