/**
 * Resolve installment application plan + partner display from stored application
 * and optional live catalog (getInstallment) — frontend only.
 */

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Merge PlanInfo[0] and PlanInfo[1] (legacy schema split) into one object */
export function getStoredPlanInfo(application) {
  const arr = application?.PlanInfo;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const a = arr[0] || {};
  const b = arr[1] || {};
  return {
    planType: a.planType || b.planType,
    planPrice: a.planPrice ?? b.planPrice,
    planpic: a.planpic || b.planpic,
    downPayment: a.downPayment ?? b.downPayment,
    monthlyInstallment: a.monthlyInstallment ?? b.monthlyInstallment,
    tenureMonths: a.tenureMonths ?? b.tenureMonths,
    interestRatePercent: a.interestRatePercent ?? b.interestRatePercent,
    interestType: a.interestType ?? b.interestType,
    cashPrice: a.cashPrice ?? b.cashPrice,
    markup: a.markup ?? b.markup,
    installmentPrice: a.installmentPrice ?? b.installmentPrice,
  };
}

const norm = (s) => String(s || '').trim().toLowerCase();

/** Find payment plan on catalog that matches what the user applied for */
export function findMatchingPaymentPlan(catalog, storedPlan, variantInfo) {
  if (!catalog || !storedPlan?.planType) return null;
  const name = norm(storedPlan.planType);
  const variantName = norm(variantInfo?.variantName);

  const matchInList = (plans) =>
    (plans || []).find((p) => norm(p.planName) === name) || null;

  if (variantName && Array.isArray(catalog.variants)) {
    const variant = catalog.variants.find(
      (v) => norm(v.variantName) === variantName
    );
    const fromVariant = matchInList(variant?.paymentPlans);
    if (fromVariant) return { plan: fromVariant, variant };
  }

  const root = matchInList(catalog.paymentPlans);
  if (root) return { plan: root, variant: null };

  for (const v of catalog.variants || []) {
    const found = matchInList(v.paymentPlans);
    if (found) return { plan: found, variant: v };
  }

  return null;
}

/** Full plan row for dashboard modal */
export function resolveAppliedPlanDisplay(application, catalog) {
  const stored = getStoredPlanInfo(application);
  const variantInfo = application?.variantInfo;
  const matched = findMatchingPaymentPlan(catalog, stored, variantInfo);
  const p = matched?.plan || {};

  return {
    stored,
    catalog,
    matchedVariant: matched?.variant || null,
    variantInfo,
    productName: catalog?.productName || null,
    productCategory: catalog?.category || null,
    productCity: catalog?.city || null,
    installmentPlanId: application?.installmentPlanId || catalog?.installmentPlanId,
    planName: stored?.planType || p.planName || 'N/A',
    variantName: variantInfo?.variantName || matched?.variant?.variantName || null,
    installmentPrice: num(stored?.planPrice) ?? num(p.installmentPrice) ?? num(stored?.installmentPrice),
    cashPrice: num(stored?.cashPrice) ?? num(p.cashPrice),
    downPayment: num(stored?.downPayment) ?? num(p.downPayment),
    monthlyInstallment: num(stored?.monthlyInstallment) ?? num(p.monthlyInstallment),
    tenureMonths: num(stored?.tenureMonths) ?? num(p.tenureMonths),
    interestRatePercent: num(stored?.interestRatePercent) ?? num(p.interestRatePercent),
    interestType: stored?.interestType || p.interestType || null,
    markup: num(stored?.markup) ?? num(p.markup),
    companyName:
      p.companyName ||
      catalog?.companyName ||
      catalog?.companyNameOther ||
      null,
    partnerId: p.partnerId || catalog?.userId || application?.createdBy || null,
  };
}

/** Partner block: API user + catalog company fields */
export function resolvePartnerDisplay(application, catalog, partnerDetails) {
  if (partnerDetails && typeof partnerDetails === 'object') {
    const cd = partnerDetails.companyDetails || {};
    return {
      source: 'api',
      partnerId: partnerDetails.userId || application?.createdBy,
      companyName:
        cd.RegisteredCompanyName ||
        cd.companyName ||
        partnerDetails.name ||
        catalog?.companyName ||
        catalog?.companyNameOther,
      contactName: partnerDetails.name || partnerDetails.userName,
      email: partnerDetails.email,
      phoneNumber: partnerDetails.phoneNumber,
      whatsapp: partnerDetails.WhatsappNumber,
      address: partnerDetails.Address || cd.HeadOfficeAddress,
      profilePic: partnerDetails.profilePic,
      companyDetails: cd,
      authorizedContacts: cd.AuthorizedContactPerson || [],
    };
  }

  const cd = catalog?.companyDetails;
  if (catalog || application?.createdBy) {
    return {
      source: 'catalog',
      partnerId: application?.createdBy || catalog?.userId,
      companyName:
        catalog?.companyName ||
        catalog?.companyNameOther ||
        cd?.RegisteredCompanyName ||
        cd?.companyName,
      contactName: null,
      email: cd?.companyEmail || cd?.email || null,
      phoneNumber: cd?.companyPhone || cd?.phoneNumber || null,
      whatsapp: cd?.WhatsappNumber || null,
      address: cd?.HeadOfficeAddress || catalog?.city,
      profilePic: catalog?.companyLogo || null,
      companyDetails: cd || {},
      authorizedContacts: cd?.AuthorizedContactPerson || [],
    };
  }

  return null;
}
