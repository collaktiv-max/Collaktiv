import "server-only";
import { stripe } from "./stripe";

// Delad av /api/checkout och /api/invoice. Vi sätter momsen explicit
// istället för att använda Stripes automatic_tax, eftersom det kräver
// att "Stripe Tax" är aktiverat och har registrerade skatteregioner på
// kontot – ett separat steg per läge (test/live) som gav ett tomt 500-
// fel i checkout så fort kontot bytte till live-läge. En egen svensk
// 25%-momssats fungerar utan den aktiveringen, i båda lägena.
export async function getSwedishMomsTaxRateId(): Promise<string> {
  const existing = await stripe.taxRates.list({ active: true, limit: 100 });
  const found = existing.data.find(
    (r) => r.country === "SE" && r.percentage === 25 && r.inclusive
  );
  if (found) return found.id;

  const created = await stripe.taxRates.create({
    display_name: "Moms",
    percentage: 25,
    inclusive: true,
    country: "SE",
    description: "Svensk moms 25%",
  });
  return created.id;
}
