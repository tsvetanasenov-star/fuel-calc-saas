const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/** Среден разход и цена на база изминати километри и заредено гориво. */
export function calculateConsumption({ km, liters, pricePerLiter }) {
  if (!(km > 0) || liters < 0 || pricePerLiter < 0) return null;

  const totalCost = liters * pricePerLiter;

  return {
    consumption: round((liters / km) * 100),
    costPerKm: round(totalCost / km, 3),
    costPer100Km: round((liters / km) * 100 * pricePerLiter),
    totalCost: round(totalCost),
    litersPerKm: round(liters / km, 3),
  };
}

/** Обща цена на пътуване, включително отиване/връщане и разделяне по пътници. */
export function calculateTrip({ distance, consumption, pricePerLiter, roundTrip, passengers }) {
  if (!(distance > 0) || consumption < 0 || pricePerLiter < 0 || !(passengers >= 1)) return null;

  const traveledKm = distance * (roundTrip ? 2 : 1);
  const liters = (traveledKm / 100) * consumption;
  const totalCost = liters * pricePerLiter;

  return {
    traveledKm,
    liters: round(liters),
    totalCost: round(totalCost),
    perPerson: round(totalCost / passengers),
    costPerKm: round(totalCost / traveledKm, 3),
    passengers,
  };
}

/** Пробег с налични литри или с определен бюджет. */
export function calculateRange({ liters, budget, consumption, pricePerLiter }) {
  if (liters < 0 || budget < 0 || !(consumption > 0) || !(pricePerLiter > 0)) return null;

  const litersFromBudget = budget / pricePerLiter;
  const valueOfLiters = liters * pricePerLiter;
  const rangeFromLiters = (liters / consumption) * 100;
  const rangeFromBudget = (litersFromBudget / consumption) * 100;

  return {
    rangeFromLiters: round(rangeFromLiters, 1),
    rangeFromBudget: round(rangeFromBudget, 1),
    valueOfLiters: round(valueOfLiters),
    litersFromBudget: round(litersFromBudget),
    liters,
    budget,
  };
}

/** Годишно и месечно сравнение на два автомобила или два вида гориво. */
export function calculateComparison({ annualKm, a, b }) {
  if (!(annualKm > 0) || a.consumption < 0 || b.consumption < 0 || a.price < 0 || b.price < 0) {
    return null;
  }

  const costOf = (option) => (annualKm / 100) * option.consumption * option.price;
  const litersOf = (option) => (annualKm / 100) * option.consumption;

  const annualA = costOf(a);
  const annualB = costOf(b);
  const difference = Math.abs(annualA - annualB);
  const cheaperKey = annualA === annualB ? null : annualA < annualB ? 'a' : 'b';
  const cheaper = cheaperKey === 'a' ? a : cheaperKey === 'b' ? b : null;
  const percent =
    Math.max(annualA, annualB) > 0 ? round((difference / Math.max(annualA, annualB)) * 100, 1) : 0;

  return {
    a: { annual: round(annualA), monthly: round(annualA / 12), liters: round(litersOf(a)) },
    b: { annual: round(annualB), monthly: round(annualB / 12), liters: round(litersOf(b)) },
    difference: round(difference),
    monthlyDifference: round(difference / 12),
    cheaper,
    cheaperKey,
    percent,
    max: Math.max(annualA, annualB),
  };
}
