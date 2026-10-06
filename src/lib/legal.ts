// Datumstämpel för den senaste sakliga ändringen av /villkor. Sparas
// tillsammans med varje betalning (se createPayment i db.ts) så vi kan
// bevisa exakt vilken version av villkoren ett företag godkände, och
// när – om texten uppdateras senare räcker det att ändra datumet här.
export const TERMS_VERSION = "2026-10-06";

export function formatTermsDate(iso: string = TERMS_VERSION): string {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
}
