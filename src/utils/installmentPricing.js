/** Monthly installment is absent or zero — treat as cash / pay-in-full pricing. */
export function isCashOnlyInstallment(monthly) {
  return !(Number(monthly) > 0);
}

export function resolveMonthlyInstallment(paymentPlan, plan) {
  return Number(paymentPlan?.monthlyInstallment ?? plan?.installment ?? 0);
}

export function resolveCashPrice(paymentPlan, plan) {
  const fromPlan = Number(paymentPlan?.cashPrice);
  if (fromPlan > 0) return fromPlan;
  return Number(plan?.price) || 0;
}

/** Valid tenure label, or null when empty / zero / placeholder. */
export function formatTenureDisplay(tenureMonths) {
  if (tenureMonths == null) return null;
  const raw = String(tenureMonths).trim();
  if (!raw || raw === "—" || raw === "-" || raw === "0") return null;
  const num = Number(raw);
  if (!Number.isNaN(num)) {
    if (num <= 0) return null;
    return `${num} Month${num === 1 ? "" : "s"}`;
  }
  return /month/i.test(raw) ? raw : `${raw} Months`;
}

/**
 * Pick best payment plan: lowest monthly when any exist; otherwise lowest cash price.
 */
export function getBestPaymentPlan(paymentPlans, plan = {}) {
  if (!Array.isArray(paymentPlans) || paymentPlans.length === 0) {
    return {
      monthlyInstallment: plan.installment || 0,
      downPayment: plan.downpayment || 0,
      tenureMonths: plan.tenure ?? plan.customTenure ?? null,
      planName: "Standard Plan",
      cashPrice: Number(plan.price) || 0,
    };
  }

  const withMonthly = paymentPlans.filter((p) => Number(p.monthlyInstallment || 0) > 0);
  const pool = withMonthly.length > 0 ? withMonthly : paymentPlans;

  const best = pool.reduce((acc, current) => {
    if (withMonthly.length > 0) {
      const cur = Number(current.monthlyInstallment || 0);
      const prev = Number(acc.monthlyInstallment || 0);
      return cur < prev ? current : acc;
    }
    const curCash = Number(current.cashPrice) || Number(plan.price) || 0;
    const prevCash = Number(acc.cashPrice) || Number(plan.price) || 0;
    return curCash > 0 && (prevCash === 0 || curCash < prevCash) ? current : acc;
  }, pool[0]);

  return {
    monthlyInstallment: Number(best.monthlyInstallment || 0),
    downPayment: best.downPayment ?? plan.downpayment ?? 0,
    tenureMonths: best.tenureMonths ?? best.customTenureLabel ?? plan.tenure ?? plan.customTenure ?? null,
    planName: best.planName || "Best Plan",
    interestRatePercent: best.interestRatePercent || 0,
    interestType: best.interestType || "",
    cashPrice: resolveCashPrice(best, plan),
  };
}

export function getInstallmentCardPricing(plan, paymentPlan) {
  const monthly = resolveMonthlyInstallment(paymentPlan, plan);
  const cashOnly = isCashOnlyInstallment(monthly);
  const cashPrice = resolveCashPrice(paymentPlan, plan);
  const downPayment = Number(
    paymentPlan?.downPayment ?? plan?.downpayment ?? (cashPrice > 0 ? cashPrice * 0.2 : 0)
  );
  const tenureLabel = cashOnly ? null : formatTenureDisplay(paymentPlan?.tenureMonths ?? paymentPlan?.tenure);

  return {
    monthly,
    cashOnly,
    cashPrice,
    downPayment,
    tenureLabel,
    primaryLabel: cashOnly ? "Cash Price" : "Monthly Payment",
    primaryAmount: cashOnly ? cashPrice : monthly,
    showPerMonth: !cashOnly,
    showCashLine: !cashOnly && cashPrice > 0,
  };
}

export function buildInstallmentShareLines(plan, paymentPlan) {
  const p = getInstallmentCardPricing(plan, paymentPlan);
  const lines = [plan?.city || "Pakistan", p.primaryLabel];
  if (p.downPayment > 0) lines.push(`Down: Rs ${p.downPayment.toLocaleString()}`);
  if (p.cashOnly) {
    lines.push(`Cash: Rs ${p.cashPrice.toLocaleString()}`);
  } else {
    lines.push(`Rs ${p.monthly.toLocaleString()}/month`);
    if (p.cashPrice > 0) lines.push(`Cash Price: Rs ${p.cashPrice.toLocaleString()}`);
    if (p.tenureLabel) lines.push(p.tenureLabel);
  }
  return lines.filter(Boolean).join("\n");
}
