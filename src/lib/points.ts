// Poängkostnaden sätts alltid automatiskt utifrån rabattvärdet i kronor
// – företaget väljer aldrig poäng själva. 4 kr rabattvärde = 1 poäng,
// alltid avrundat uppåt till närmaste 5-tal (t.ex. 16 kr -> 4 p -> 5 p).
export function calcPointsCost(discountValueKr: number): number {
  if (!discountValueKr || discountValueKr <= 0) return 0;
  const rawPoints = discountValueKr / 4;
  return Math.ceil(rawPoints / 5) * 5;
}
