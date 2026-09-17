function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };
}

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"];

export function getWeeklyViews(seed: string, baseline: number) {
  const rand = seededRandom(seed + "-week");
  return WEEKDAYS.map((day, i) => {
    const weekendBoost = i >= 4 ? 1.3 : 1;
    const value = Math.max(
      4,
      Math.round((baseline / 7) * weekendBoost * (0.6 + rand() * 0.8))
    );
    return { day, value };
  });
}

const HOURS = [8, 10, 12, 14, 16, 18, 20];

export function estimateExposure(seed: string, tier: "standard" | "premium") {
  const rand = seededRandom(seed + "-exposure");
  const base = 2400 + Math.round(rand() * 1600);
  const tierMultiplier = tier === "premium" ? 1.7 : 1;
  const monthlyViews = Math.round(base * tierMultiplier);
  const estRedemptions = Math.round(monthlyViews * (0.06 + rand() * 0.03));
  const estNewCustomers = Math.round(estRedemptions * (0.3 + rand() * 0.15));
  return { monthlyViews, estRedemptions, estNewCustomers };
}

export function getPopularHours(seed: string) {
  const rand = seededRandom(seed + "-hours");
  return HOURS.map((hour) => {
    const lunchBoost = hour === 12 || hour === 14 ? 1.6 : 1;
    const eveningBoost = hour === 18 ? 1.4 : 1;
    const value = Math.round(
      30 * lunchBoost * eveningBoost * (0.5 + rand() * 0.7)
    );
    return { hour: `${hour}–${hour + 2}`, value };
  });
}
