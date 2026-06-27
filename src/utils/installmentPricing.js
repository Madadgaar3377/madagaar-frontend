/** Monthly installment is absent or zero  treat as cash / pay-in-full pricing. */

export function isCashOnlyInstallment(monthly) {

  return !(Number(monthly) > 0);

}

function planHasFinanceDetails(plan) {
  if (!plan?.finance) return false;
  const bank = String(plan.finance.bankName || "").trim();
  const info = String(plan.finance.financeInfo || "").replace(/<[^>]*>/g, " ").trim();
  return Boolean(bank || info);
}

/** True when partner configured a real installment/finance plan (not an empty row). */
export function isRealInstallmentPlan(plan) {
  if (!plan || !String(plan.planName || "").trim()) return false;
  if (planHasFinanceDetails(plan)) return true;
  return Number(plan.monthlyInstallment) > 0 || Number(plan.installmentPrice) > 0;
}



export function resolveMonthlyInstallment(paymentPlan, plan) {

  return Number(paymentPlan?.monthlyInstallment ?? plan?.installment ?? 0);

}



export function calcDiscountPercentFromPrices(cashPrice, discountedPrice) {

  const cash = Number(cashPrice) || 0;

  const discounted = Number(discountedPrice);

  if (cash <= 0 || !Number.isFinite(discounted) || discounted < 0) return 0;

  const pct = ((cash - discounted) / cash) * 100;

  return Math.round(Math.min(100, Math.max(0, pct)) * 100) / 100;

}



export function calcDiscountedPriceFromPercent(cashPrice, discountPercent) {

  const cash = Number(cashPrice) || 0;

  const disc = Math.min(100, Math.max(0, Number(discountPercent) || 0));

  return Math.round(cash * (1 - disc / 100));

}



function isExplicitPriceSet(value) {

  return (

    value !== undefined &&

    value !== null &&

    value !== "" &&

    Number.isFinite(Number(value)) &&

    Number(value) > 0

  );

}



/**

 * Public cash price display rules:

 * - Only cash OR only discounted → show the one that is set as cash price

 * - Both cash and discounted → show discounted + original cash (discount %)

 */

export function resolvePriceDisplay({ price, cashPrice, discountedPrice, discountPercent } = {}) {

  const cash = Number(price ?? cashPrice) || 0;

  const hasCash = cash > 0;

  const hasExplicitDiscounted = isExplicitPriceSet(discountedPrice);

  const explicitDiscounted = hasExplicitDiscounted ? Math.round(Number(discountedPrice)) : 0;

  const pct = Math.min(100, Math.max(0, Number(discountPercent) || 0));

  const derivedDiscounted = hasCash && pct > 0 ? calcDiscountedPriceFromPercent(cash, pct) : 0;



  if (hasCash && (hasExplicitDiscounted || pct > 0)) {

    const discounted = hasExplicitDiscounted ? explicitDiscounted : derivedDiscounted;

    if (discounted > 0 && discounted < cash) {

      return {

        displayPrice: discounted,

        cashPrice: cash,

        discountPercent: hasExplicitDiscounted

          ? calcDiscountPercentFromPrices(cash, discounted)

          : pct,

        hasDiscount: true,

      };

    }

  }



  if (hasExplicitDiscounted && !hasCash) {

    return {

      displayPrice: explicitDiscounted,

      cashPrice: 0,

      discountPercent: 0,

      hasDiscount: false,

    };

  }



  if (hasCash) {

    return {

      displayPrice: cash,

      cashPrice: cash,

      discountPercent: 0,

      hasDiscount: false,

    };

  }



  return {

    displayPrice: 0,

    cashPrice: 0,

    discountPercent: 0,

    hasDiscount: false,

  };

}



export function getVariantEffectivePrice(variant) {

  if (!variant) return 0;

  const display = resolvePriceDisplay({

    price: variant.price,

    discountedPrice: variant.discountedPrice,

    discountPercent: variant.discountPercent,

  });

  return display.displayPrice;

}



export function getPartnerOverrideEffective(override) {

  if (!override) return 0;

  const display = resolvePriceDisplay({

    cashPrice: override.cashPrice,

    discountPercent: override.discountPercent,

  });

  return display.displayPrice;

}



export function getProductPriceDisplay(plan, variantIndex = null) {

  if (!plan) return resolvePriceDisplay({});



  if (variantIndex !== null && variantIndex !== undefined && plan.variants?.[variantIndex]) {

    const v = plan.variants[variantIndex];

    return resolvePriceDisplay({

      price: v.price,

      discountedPrice: v.discountedPrice,

      discountPercent: v.discountPercent,

    });

  }



  const catalogDisplays = (plan.variants || [])

    .filter((v) => !isPartnerOwnedVariant(v))

    .map((v) =>

      resolvePriceDisplay({

        price: v.price,

        discountedPrice: v.discountedPrice,

        discountPercent: v.discountPercent,

      })

    )

    .filter((d) => d.displayPrice > 0);



  if (catalogDisplays.length) {

    return catalogDisplays.reduce((a, b) => (a.displayPrice < b.displayPrice ? a : b));

  }



  return resolvePriceDisplay({

    price: plan.price,

    discountedPrice: plan.discountedPrice,

    discountPercent: plan.discountPercent,

  });

}



export function getOfferPriceDisplay(plan, offer) {

  if (!plan || !offer) return resolvePriceDisplay({});



  const vIdx = offer.variantIndex;

  const pid = offer.partnerId;



  if (offer.source === "catalogVariant" || offer.source === "partnerVariant") {

    const v = plan.variants?.[vIdx];

    return resolvePriceDisplay({

      price: v?.price,

      discountedPrice: v?.discountedPrice,

      discountPercent: v?.discountPercent,

    });

  }



  if (offer.source === "variantOverride") {

    const ov = (plan.partnerPricing || [])

      .find((p) => p?.partnerId && String(p.partnerId) === String(pid))

      ?.variantOverrides?.find((o) => Number(o.variantIndex) === Number(vIdx));

    return resolvePriceDisplay({

      cashPrice: ov?.cashPrice,

      discountPercent: ov?.discountPercent,

    });

  }



  if (offer.source === "partnerBasePrice") {

    const pp = (plan.partnerPricing || []).find(

      (p) => p?.partnerId && String(p.partnerId) === String(pid)

    );

    return resolvePriceDisplay({ price: pp?.basePrice });

  }



  return resolvePriceDisplay({ price: offer.price });

}



export function resolveEntryPriceDisplay(plan, entry) {

  if (!plan || !entry) return getProductPriceDisplay(plan);



  const p = entry.plan || {};

  const vIdx = entry.variantIndex;

  const partnerId = p?.partnerId;



  if (partnerId) {

    if (vIdx !== null && vIdx !== undefined) {

      const ov = (plan.partnerPricing || [])

        .find((pp) => pp?.partnerId && String(pp.partnerId) === String(partnerId))

        ?.variantOverrides?.find((o) => Number(o.variantIndex) === Number(vIdx));

      if (ov && Number(ov.cashPrice) > 0) {

        return resolvePriceDisplay({

          cashPrice: ov.cashPrice,

          discountPercent: ov.discountPercent,

        });

      }

    }

    const pp = (plan.partnerPricing || []).find(

      (row) => row?.partnerId && String(row.partnerId) === String(partnerId)

    );

    if (Number(pp?.basePrice) > 0) {

      return resolvePriceDisplay({ price: pp.basePrice });

    }

  }



  if (vIdx !== null && vIdx !== undefined && plan.variants?.[vIdx]) {

    const v = plan.variants[vIdx];

    return resolvePriceDisplay({

      price: v.price,

      discountedPrice: v.discountedPrice,

      discountPercent: v.discountPercent,

    });

  }



  return resolvePriceDisplay({ price: plan.price });

}



export function isPartnerOwnedVariant(variant) {

  return Boolean(variant?.partnerId && String(variant.partnerId).trim());

}



export function getOwnerUserId(plan) {

  return plan?.createdBy?.[0]?.userId || plan?.user || plan?.userId || "";

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

  if (!raw || raw === "" || raw === "-" || raw === "0") return null;

  const num = Number(raw);

  if (!Number.isNaN(num)) {

    if (num <= 0) return null;

    return `${num} Month${num === 1 ? "" : "s"}`;

  }

  return /month/i.test(raw) ? raw : `${raw} Months`;

}



/** All payment plans on a product (root + every variant). */

export function collectAllPaymentPlans(plan) {

  if (!plan) return [];

  const root = plan.paymentPlans || [];

  const fromVariants = (plan.variants || []).flatMap((v) => v.paymentPlans || []);

  return [...root, ...fromVariants];

}



export function resolvePartnerCashForVariant(plan, partnerId, variantIndex) {

  if (!plan || !partnerId) return 0;

  const entry = (plan.partnerPricing || []).find(

    (p) => p?.partnerId && String(p.partnerId) === String(partnerId)

  );

  if (!entry) return 0;



  if (variantIndex !== null && variantIndex !== undefined && Number.isFinite(Number(variantIndex))) {

    const ov = (entry.variantOverrides || []).find(

      (o) => Number(o.variantIndex) === Number(variantIndex)

    );

    const fromOverride = getPartnerOverrideEffective(ov);

    if (fromOverride > 0) return fromOverride;

  }



  return Number(entry.basePrice) || 0;

}



/** Cash price for a plan row (respects partner overrides + variant listing price). */

export function resolveEntryCashPrice(plan, entry) {

  if (!plan || !entry) return Number(plan?.price) || 0;



  const p = entry.plan || {};

  const vIdx = entry.variantIndex;

  const partnerId = p?.partnerId;



  if (partnerId) {

    const partnerCash = resolvePartnerCashForVariant(plan, partnerId, vIdx);

    if (partnerCash > 0) return partnerCash;

    const fromPlan = Number(p.cashPrice);

    if (fromPlan > 0) return fromPlan;

  }



  if (vIdx !== null && vIdx !== undefined && plan.variants?.[vIdx]) {

    return getVariantEffectivePrice(plan.variants[vIdx]);

  }



  return Number(plan.price) || 0;

}



export function resolveProductDisplayPrice(plan, variantIndex = null) {

  if (!plan) return 0;



  if (variantIndex !== null && variantIndex !== undefined && plan.variants?.[variantIndex]) {

    return getVariantEffectivePrice(plan.variants[variantIndex]);

  }



  const catalogPrices = (plan.variants || [])

    .filter((v) => !isPartnerOwnedVariant(v))

    .map(getVariantEffectivePrice)

    .filter((p) => p > 0);



  if (catalogPrices.length) return Math.min(...catalogPrices);



  return getLowestPublicCashPrice(plan, null);

}



/**

 * Build per-partner cash offers (base, variant overrides, partner-owned variants, plan cash).

 */

export function buildPartnerCashOffers(plan, options = {}) {

  if (!plan) return [];



  const { variantIndex = null } = options;

  const plansToScan = options.currentPlans ?? collectAllPaymentPlans(plan);

  const safeStr = (v) => (v == null ? "" : String(v));

  const byKey = new Map();



  const upsert = ({

    partnerId,

    companyName,

    companyLogo,

    price,

    source,

    variantIndex: vIdx = null,

    variantName = "",

  }) => {

    const pid = safeStr(partnerId);

    const vKey = vIdx !== null && vIdx !== undefined ? `:v${vIdx}` : "";

    const key = `${pid || "__global__"}:${safeStr(companyName)}${vKey}`;

    const next = {

      partnerId: pid,

      companyName: companyName || "Partner",

      companyLogo: companyLogo || "",

      price: Number(price) || 0,

      source,

      variantIndex: vIdx,

      variantName: variantName || "",

    };

    const prev = byKey.get(key);

    if (!prev) {

      byKey.set(key, next);

      return;

    }

    if ((Number(prev.price) || 0) === 0 && next.price > 0) byKey.set(key, next);

    if (!prev.companyName && next.companyName) prev.companyName = next.companyName;

    if (!prev.companyLogo && next.companyLogo) prev.companyLogo = next.companyLogo;

    if (!prev.variantName && next.variantName) prev.variantName = next.variantName;

    byKey.set(key, prev);

  };



  const ownerId = getOwnerUserId(plan);

  const ownerName =

    plan.createdBy?.[0]?.name ||

    plan.companyName ||

    plan.companyNameOther ||

    "Listing";



  const partnerMeta = (partnerId) => {

    const pid = safeStr(partnerId);

    if (!pid) return { companyName: null, companyLogo: null };

    const fromPlan = plansToScan.find(

      (p) => p?.partnerId && String(p.partnerId) === pid

    );

    if (fromPlan?.companyName) {

      return { companyName: fromPlan.companyName, companyLogo: fromPlan.companyLogo || "" };

    }

    const fromCreator = (plan.createdBy || []).find(

      (c) => c?.userId && String(c.userId) === pid

    );

    if (fromCreator) {

      return {

        companyName: fromCreator.name || fromCreator.companyName || null,

        companyLogo: fromCreator.profileImage || "",

      };

    }

    return { companyName: null, companyLogo: null };

  };



  (plan.variants || []).forEach((v, vIdx) => {

    if (variantIndex !== null && vIdx !== variantIndex) return;



    const price = getVariantEffectivePrice(v);

    if (price <= 0) return;



    if (isPartnerOwnedVariant(v)) {

      const meta = partnerMeta(v.partnerId);

      upsert({

        partnerId: v.partnerId,

        companyName: meta.companyName,

        companyLogo: meta.companyLogo,

        price,

        source: "partnerVariant",

        variantIndex: vIdx,

        variantName: v.variantName || `Option ${vIdx + 1}`,

      });

      return;

    }



    upsert({

      partnerId: ownerId,

      companyName: ownerName,

      companyLogo: plan.createdBy?.[0]?.profileImage || "",

      price,

      source: "catalogVariant",

      variantIndex: vIdx,

      variantName: v.variantName || `Variant ${vIdx + 1}`,

    });

  });



  if (Array.isArray(plan.partnerPricing)) {

    for (const pp of plan.partnerPricing) {

      const pid = pp?.partnerId;

      const meta = partnerMeta(pid);



      if (Array.isArray(pp.variantOverrides)) {

        for (const ov of pp.variantOverrides) {

          const vIdx = Number(ov.variantIndex);

          if (!Number.isFinite(vIdx) || vIdx < 0) continue;

          if (variantIndex !== null && vIdx !== variantIndex) continue;



          const price = getPartnerOverrideEffective(ov);

          if (price <= 0) continue;



          upsert({

            partnerId: pid,

            companyName: meta.companyName,

            companyLogo: meta.companyLogo,

            price,

            source: "variantOverride",

            variantIndex: vIdx,

            variantName: plan.variants?.[vIdx]?.variantName || `Variant ${vIdx + 1}`,

          });

        }

      }



      const base = Number(pp.basePrice) || 0;

      if (base > 0) {

        const hasVariantOverrideForSelection =

          variantIndex !== null &&

          (pp.variantOverrides || []).some(

            (o) =>

              Number(o.variantIndex) === variantIndex &&

              getPartnerOverrideEffective(o) > 0

          );



        if (variantIndex === null || !hasVariantOverrideForSelection) {

          upsert({

            partnerId: pid,

            companyName: meta.companyName,

            companyLogo: meta.companyLogo,

            price: base,

            source: "partnerBasePrice",

            variantIndex: variantIndex,

            variantName:

              variantIndex !== null

                ? plan.variants?.[variantIndex]?.variantName || ""

                : "",

          });

        }

      }

    }

  }



  for (const p of plansToScan) {

    const cash = Number(p?.cashPrice) || 0;

    if (cash <= 0) continue;

    const pVariant = p?.variantIndex;

    if (

      variantIndex !== null &&

      pVariant !== null &&

      pVariant !== undefined &&

      Number(pVariant) !== variantIndex

    ) {

      continue;

    }

    upsert({

      partnerId: p?.partnerId,

      companyName: p?.companyName,

      companyLogo: p?.companyLogo,

      price: cash,

      source: "planCashPrice",

      variantIndex:

        pVariant !== null && pVariant !== undefined ? Number(pVariant) : null,

      variantName:

        pVariant !== null && pVariant !== undefined

          ? plan.variants?.[Number(pVariant)]?.variantName || ""

          : "",

    });

  }



  if (!plan.variants?.length) {

    const globalPrice = Number(plan.price) || 0;

    if (globalPrice > 0 && variantIndex === null) {

      upsert({

        partnerId: ownerId,

        companyName: ownerName,

        companyLogo: "",

        price: globalPrice,

        source: "global",

        variantIndex: null,

        variantName: "",

      });

    }

  }



  for (const p of plansToScan) {

    const pid = safeStr(p?.partnerId);

    if (!pid) continue;

    for (const [key, v] of byKey.entries()) {

      if (v.partnerId === pid) {

        if (!v.companyName && p?.companyName) v.companyName = p.companyName;

        if (!v.companyLogo && p?.companyLogo) v.companyLogo = p.companyLogo;

        byKey.set(key, v);

      }

    }

  }



  return Array.from(byKey.values())

    .filter((x) => Number(x.price) > 0)

    .sort((a, b) => Number(a.price) - Number(b.price));

}



export function getLowestPublicCashPrice(plan, variantIndex = null) {

  const offers = buildPartnerCashOffers(plan, { variantIndex });

  if (offers.length) return Math.min(...offers.map((o) => Number(o.price) || 0));

  return resolveProductDisplayPrice(plan, variantIndex);

}



export function getBestPaymentPlan(paymentPlans, plan = {}) {

  const allPlans =

    Array.isArray(paymentPlans) && paymentPlans.length > 0

      ? paymentPlans

      : collectAllPaymentPlans(plan);



  if (!allPlans.length) {

    const cashPrice = getLowestPublicCashPrice(plan);

    return {

      monthlyInstallment: plan.installment || 0,

      downPayment: plan.downpayment || 0,

      tenureMonths: plan.tenure ?? plan.customTenure ?? null,

      planName: "Standard Plan",

      cashPrice,

    };

  }



  const withMonthly = allPlans.filter((p) => Number(p.monthlyInstallment || 0) > 0);

  const pool = withMonthly.length > 0 ? withMonthly : allPlans;



  const best = pool.reduce((acc, current) => {

    if (withMonthly.length > 0) {

      const cur = Number(current.monthlyInstallment || 0);

      const prev = Number(acc.monthlyInstallment || 0);

      return cur < prev ? current : acc;

    }

    const curCash = Number(current.cashPrice) || getLowestPublicCashPrice(plan);

    const prevCash = Number(acc.cashPrice) || getLowestPublicCashPrice(plan);

    return curCash > 0 && (prevCash === 0 || curCash < prevCash) ? current : acc;

  }, pool[0]);



  return {

    monthlyInstallment: Number(best.monthlyInstallment || 0),

    downPayment: best.downPayment ?? plan.downpayment ?? 0,

    tenureMonths: best.tenureMonths ?? best.customTenureLabel ?? plan.tenure ?? plan.customTenure ?? null,

    planName: best.planName || "Best Plan",

    interestRatePercent: best.interestRatePercent || 0,

    interestType: best.interestType || "",

    cashPrice: Number(best.cashPrice) > 0 ? Number(best.cashPrice) : getLowestPublicCashPrice(plan),

  };

}



export function getInstallmentCardPricing(plan, paymentPlan) {

  const monthly = resolveMonthlyInstallment(paymentPlan, plan);

  const cashOnly = isCashOnlyInstallment(monthly);

  const cashPrice =

    Number(paymentPlan?.cashPrice) > 0

      ? Number(paymentPlan.cashPrice)

      : getLowestPublicCashPrice(plan);

  const downPayment = Number(

    paymentPlan?.downPayment ?? plan?.downpayment ?? (cashPrice > 0 ? cashPrice * 0.2 : 0)

  );

  const tenureLabel = cashOnly ? null : formatTenureDisplay(paymentPlan?.tenureMonths ?? paymentPlan?.tenure);



  const cashDisplay = getProductPriceDisplay(plan);



  return {

    monthly,

    cashOnly,

    cashPrice,

    cashDisplay,

    downPayment,

    tenureLabel,

    primaryLabel: cashOnly ? "Cash Price" : "Monthly Payment",

    primaryAmount: cashOnly ? cashDisplay.displayPrice || cashPrice : monthly,

    showPerMonth: !cashOnly,

    showCashLine: !cashOnly && (cashDisplay.displayPrice > 0 || cashPrice > 0),

  };

}



export function buildPlanEntries(plan, selectedVariantIndex) {

  if (!plan) return [];



  if (selectedVariantIndex !== null && plan.variants?.[selectedVariantIndex]) {

    const variantPlans = plan.variants[selectedVariantIndex].paymentPlans || [];

    const plansToShow =
      variantPlans.length > 0 ? variantPlans : plan.paymentPlans || [];

    return plansToShow.filter(isRealInstallmentPlan).map((p, planIndex) => ({

      plan: p,

      variantIndex: selectedVariantIndex,

      planIndex,

    }));

  }



  const entries = [];

  (plan.paymentPlans || []).forEach((p, planIndex) => {
    if (!isRealInstallmentPlan(p)) return;
    entries.push({ plan: p, variantIndex: null, planIndex });
  });

  (plan.variants || []).forEach((v, variantIndex) => {
    (v.paymentPlans || []).forEach((p, planIndex) => {
      if (!isRealInstallmentPlan(p)) return;
      entries.push({ plan: p, variantIndex, planIndex });
    });
  });

  return entries;

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



/** @deprecated Use buildPartnerCashOffers */
export function buildCashOffers(plan, currentPlans) {
  return buildPartnerCashOffers(plan, { currentPlans });
}

/** Label for apply-form plan dropdown */
export function formatApplyEntryLabel(plan, entry) {
  if (!entry?.plan) return "Payment plan";
  const p = entry.plan;
  const vendor = p.companyName || plan?.companyName || plan?.companyNameOther || "Partner";
  const variantName =
    entry.variantIndex !== null && entry.variantIndex !== undefined
      ? plan?.variants?.[entry.variantIndex]?.variantName
      : null;
  const monthly = Number(p.monthlyInstallment) || 0;
  const pricePart =
    monthly > 0
      ? `PKR ${monthly.toLocaleString()}/mo`
      : `Cash PKR ${(Number(p.cashPrice) || resolveEntryCashPrice(plan, entry)).toLocaleString()}`;
  const tenure = Number(p.tenureMonths) > 0 ? `${p.tenureMonths} months` : null;
  return [p.planName || "Plan", variantName, vendor, pricePart, tenure]
    .filter(Boolean)
    .join(" · ");
}

export function findApplyEntryIndex(planEntries, variantIndex, planIndex) {
  if (!planEntries?.length) return -1;
  return planEntries.findIndex(
    (e) =>
      e.planIndex === planIndex &&
      (e.variantIndex ?? null) === (variantIndex ?? null)
  );
}

export function entryToApplyQuery(entry) {
  const params = new URLSearchParams();
  params.set("planIndex", String(entry.planIndex));
  if (entry.variantIndex !== null && entry.variantIndex !== undefined) {
    params.set("variantIndex", String(entry.variantIndex));
  }
  return `?${params.toString()}`;
}

/** Stable key for a partner cash offer row in apply UI */
export function cashOfferKey(offer) {
  if (!offer) return "";
  const pid = offer.partnerId != null ? String(offer.partnerId) : "listing";
  return `${pid}:${offer.price}:${offer.source || ""}`;
}

export function findCashOfferByKey(offers, key) {
  if (!key || !offers?.length) return null;
  return offers.find((o) => cashOfferKey(o) === key) || null;
}

