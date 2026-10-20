import { APP_LAUNCH_DATE } from "./config";

// Delas av admin-panelen ("Ge kostnadsfritt" i AdminSections.tsx) och
// portalens egna sidor (profil, publicera) – vald i admin, påverkar
// vad företaget ser och när åtkomsten räknas som förbrukad.
export type ComplimentaryDuration = "1m" | "3m" | "6m" | "1y" | "indefinite";

export const COMPLIMENTARY_DURATION_OPTIONS: { id: ComplimentaryDuration; label: string }[] = [
  { id: "1m", label: "1 månad" },
  { id: "3m", label: "3 månader" },
  { id: "6m", label: "6 månader" },
  { id: "1y", label: "1 år" },
  { id: "indefinite", label: "Tillsvidare" },
];

const COMPLIMENTARY_DURATION_MONTHS: Record<Exclude<ComplimentaryDuration, "indefinite">, number> = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
};

export function complimentaryDurationLabel(duration: ComplimentaryDuration): string {
  return COMPLIMENTARY_DURATION_OPTIONS.find((o) => o.id === duration)?.label ?? "";
}

// Löptiden ska räknas från lanseringen för resenärer (APP_LAUNCH_DATE),
// inte från dagen admin trycker på "Ge kostnadsfritt" – annars skulle
// ett företag som går med innan appen är live kunna hinna förbruka hela
// sin gratisperiod innan den gav dem något värde alls. Så länge
// lanseringsdatumet inte är satt vet vi inte när löptiden börjar, och
// returnerar då inget slutdatum än – se backfillen i reminders.ts för
// när befintliga löptider räknas ut i efterhand, den dag datumet sätts.
export function computeComplimentaryUntil(duration: ComplimentaryDuration): string | undefined {
  if (duration === "indefinite" || !APP_LAUNCH_DATE) return undefined;
  const until = new Date(APP_LAUNCH_DATE);
  until.setMonth(until.getMonth() + COMPLIMENTARY_DURATION_MONTHS[duration]);
  return until.toISOString();
}
