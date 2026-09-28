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

export function estimateExposure(seed: string, tier: "standard" | "premium") {
  const rand = seededRandom(seed + "-exposure");
  const base = 2400 + Math.round(rand() * 1600);
  const tierMultiplier = tier === "premium" ? 1.7 : 1;
  const monthlyViews = Math.round(base * tierMultiplier);
  const estRedemptions = Math.round(monthlyViews * (0.06 + rand() * 0.03));
  const estNewCustomers = Math.round(estRedemptions * (0.3 + rand() * 0.15));
  return { monthlyViews, estRedemptions, estNewCustomers };
}
