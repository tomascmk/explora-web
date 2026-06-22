/**
 * F-23: mínimo de precio para tours GUIDED pagos (no free-walking) y custom.
 *
 * El mínimo autoritativo vive en platform-settings de la API
 * (`minTourPricePerCurrency` / `defaultMinTourPrice`), pero esa query es
 * admin-only, así que en el portal del guía usamos estos defaults como hint de
 * UX. La validación real la hace el backend, que devuelve el mínimo vigente en
 * el mensaje de error (`TOUR_PRICE_BELOW_MINIMUM`).
 */
export const DEFAULT_MIN_TOUR_PRICE = 5;

export const MIN_TOUR_PRICE_BY_CURRENCY: Record<string, number> = {
  USD: 5,
};

export function getMinTourPrice(currency: string): number {
  return MIN_TOUR_PRICE_BY_CURRENCY[currency] ?? DEFAULT_MIN_TOUR_PRICE;
}
