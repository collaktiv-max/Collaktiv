// Enda källan till sanning för priser. Både prissektionen och
// jämförelsetabellen på startsidan räknar utifrån dessa värden, så de
// aldrig kan hamna i otakt med varandra.

export type BillingPeriod = "sixMonths" | "year";
export type PlanId = "standard" | "premium";

export const EARLY_BIRD_SLOTS = 50;
export const EARLY_BIRD_DISCOUNT = 0.2; // 20%

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  prices: Record<BillingPeriod, number>;
  features: string[];
}

export const PLANS: PlanDefinition[] = [
  {
    id: "standard",
    name: "Standard",
    tagline: "Bra start för att synas i appen",
    prices: {
      sixMonths: 2999,
      year: 5399,
    },
    features: [
      "Begränsad synlighet",
      "Begränsad statistik",
      "Max 2 erbjudanden",
      "Ett presentationsinlägg",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Mer synlighet, mer data, mer resultat",
    prices: {
      sixMonths: 4199,
      year: 7599,
    },
    features: [
      "Prioriterad placering",
      "Full tillgång till statistik",
      "Max 5 erbjudanden",
      "Större synlighet på sociala medier",
      "Möjlighet till en riktad kampanj",
    ],
  },
];

export const BILLING_LABELS: Record<BillingPeriod, string> = {
  sixMonths: "6 månader",
  year: "1 år",
};

export const BILLING_MONTHS: Record<BillingPeriod, number> = {
  sixMonths: 6,
  year: 12,
};

function round(value: number) {
  return Math.round(value);
}

export function getPlan(id: PlanId) {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function getTotal(plan: PlanDefinition, period: BillingPeriod) {
  return plan.prices[period];
}

export function getMonthly(plan: PlanDefinition, period: BillingPeriod) {
  return round(getTotal(plan, period) / BILLING_MONTHS[period]);
}

export function getDiscountedTotal(plan: PlanDefinition, period: BillingPeriod) {
  return round(getTotal(plan, period) * (1 - EARLY_BIRD_DISCOUNT));
}

export function getDiscountedMonthly(plan: PlanDefinition, period: BillingPeriod) {
  return round(getDiscountedTotal(plan, period) / BILLING_MONTHS[period]);
}

export function getYearlySavings(plan: PlanDefinition) {
  return plan.prices.sixMonths * 2 - plan.prices.year;
}

export function formatKr(value: number) {
  return `${value.toLocaleString("sv-SE")} kr`;
}

// Standardpaketets lägsta pris just nu (early bird, årsbetalning) –
// används som referens i jämförelsetabellen.
export const CHEAPEST_MONTHLY_PRICE = getDiscountedMonthly(getPlan("standard"), "year");
export const CHEAPEST_MONTHLY_PRICE_REGULAR = getMonthly(getPlan("standard"), "year");
