import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getAuthToken, getUser, isAuthenticated } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import SEO from '../../../components/SEO';
import { Toast, useToast } from '../../../components/Toast';
import CashPriceDisplay from '../../../components/CashPriceDisplay';
import {
  buildPlanEntries,
  buildPartnerCashOffers,
  resolveEntryCashPrice,
  resolveEntryPriceDisplay,
  getHeroCashPriceDisplay,
  getOfferPriceDisplay,
  formatApplyEntryLabel,
  findApplyEntryIndex,
  cashOfferKey,
  findCashOfferByKey,
  isPartnerOwnedVariant,
  isCashOnlyInstallment,
} from '../../../utils/installmentPricing';
import InstallmentCheckoutStep from './InstallmentCheckoutStep';
import cities from '../../../constants/cities';
import { getAreasForCity } from '../../../constants/cityAreas';
import { FormSection, inputClass, labelClass } from './InstallmentApplyShared';

const buildApplicationNote = (formData) => {
  const meta = [
    formData.cnic && `CNIC: ${formData.cnic.trim()}`,
    formData.alternativePhone && `Alternative phone: ${formData.alternativePhone.trim()}`,
    formData.area && `Area: ${formData.area.trim()}`,
  ].filter(Boolean);

  const notes = (formData.applicationNote || '').trim();
  if (meta.length && notes) return `${meta.join('\n')}\n---\n${notes}`;
  if (meta.length) return meta.join('\n');
  return notes;
};

const ApplyInstallment = () => {
  const { id } = useParams(); // installment plan ID
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = getUser();
  
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [plan, setPlan] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [selectedEntryIdx, setSelectedEntryIdx] = useState(0);
  /** Which partner cash offer (when no installment plan on variant) */
  const [selectedCashOfferKey, setSelectedCashOfferKey] = useState('');
  const [currentStep, setCurrentStep] = useState('details');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || '',
    alternativePhone: '',
    cnic: currentUser?.cnicNumber || '',
    address: currentUser?.Address || '',
    city: '',
    area: '',
    state: '',
    zip: '',
    country: 'Pakistan',
    occupation: '',
    employerName: '',
    employerAddress: '',
    jobTitle: '',
    monthlyIncome: '',
    otherIncomeSources: '',
    workContactNumber: '',
    applicationNote: '',
  });

  const fetchPlanDetails = useCallback(async () => {
    try {
      setLoadingPlan(true);
      const response = await fetch(`${backendBaseUrl}/getInstallment/${encodeURIComponent(id)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load plan details');
      }

      // Handle both array and object responses
      const planData = Array.isArray(data.data) ? data.data[0] : data.data;
      
      if (!planData) {
        throw new Error('Plan data not found');
      }

      setPlan(planData);
    } catch (err) {
      console.error('Plan fetch error:', err);
      showError(err.message || 'Failed to load installment plan');
    } finally {
      setLoadingPlan(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/account');
      return;
    }

    // Extract plan/variant indices from URL query (?planIndex=0&variantIndex=1)
    const pIdx = searchParams.get('planIndex');
    const vIdx = searchParams.get('variantIndex');
    if (pIdx !== null && !Number.isNaN(Number(pIdx))) setSelectedPlanIndex(parseInt(pIdx, 10));
    if (vIdx !== null && !Number.isNaN(Number(vIdx))) setSelectedVariantIndex(parseInt(vIdx, 10));

    if (id) fetchPlanDetails();
  }, [fetchPlanDetails, router, searchParams, id]);

  const variantCount = plan?.variants?.length || 0;
  const showVariantPicker = variantCount > 0;

  const planEntries = useMemo(
    () => buildPlanEntries(plan, selectedVariantIndex),
    [plan, selectedVariantIndex]
  );

  const variantCashOffers = useMemo(() => {
    if (selectedVariantIndex === null || selectedVariantIndex === undefined || !plan) {
      return [];
    }
    return buildPartnerCashOffers(plan, { variantIndex: selectedVariantIndex });
  }, [plan, selectedVariantIndex]);

  const needsCashPartnerPick =
    selectedVariantIndex !== null &&
    planEntries.length === 0 &&
    variantCashOffers.length > 0;

  const selectedCashOffer = useMemo(
    () => findCashOfferByKey(variantCashOffers, selectedCashOfferKey),
    [variantCashOffers, selectedCashOfferKey]
  );

  useEffect(() => {
    if (!plan) return;
    if (variantCount === 1 && selectedVariantIndex === null) {
      setSelectedVariantIndex(0);
    }
  }, [plan, variantCount, selectedVariantIndex]);

  useEffect(() => {
    if (!planEntries.length) return;
    const idx = findApplyEntryIndex(planEntries, selectedVariantIndex, selectedPlanIndex);
    if (idx >= 0) {
      setSelectedEntryIdx(idx);
    } else {
      setSelectedEntryIdx(0);
      const first = planEntries[0];
      setSelectedPlanIndex(first.planIndex);
      if (first.variantIndex !== null && first.variantIndex !== undefined) {
        setSelectedVariantIndex(first.variantIndex);
      }
    }
  }, [planEntries, selectedVariantIndex, selectedPlanIndex]);

  useEffect(() => {
    if (!needsCashPartnerPick) {
      setSelectedCashOfferKey('');
      return;
    }
    const stillValid = variantCashOffers.some(
      (o) => cashOfferKey(o) === selectedCashOfferKey
    );
    if (!stillValid && variantCashOffers.length > 0) {
      setSelectedCashOfferKey(cashOfferKey(variantCashOffers[0]));
    }
  }, [needsCashPartnerPick, variantCashOffers, selectedCashOfferKey]);

  const selectedEntry = planEntries[selectedEntryIdx] || null;
  const selectedPlan = selectedEntry?.plan || null;
  const selectedVariant =
    selectedVariantIndex !== null ? plan?.variants?.[selectedVariantIndex] : null;
  const summaryCashPrice = selectedPlan
    ? resolveEntryCashPrice(plan, selectedEntry)
    : Number(selectedCashOffer?.price) || 0;
  const summaryCashDisplay = selectedPlan
    ? resolveEntryPriceDisplay(plan, selectedEntry)
    : selectedCashOffer
    ? getOfferPriceDisplay(plan, selectedCashOffer)
    : getHeroCashPriceDisplay(plan, selectedVariantIndex);
  const resolvedPartnerName = selectedPlan?.companyName
    || selectedCashOffer?.companyName
    || plan?.companyName
    || plan?.companyNameOther
    || 'Partner';
  const resolvedPartnerId =
    selectedPlan?.partnerId ||
    selectedCashOffer?.partnerId ||
    selectedVariant?.partnerId ||
    '';
  const partnerLogo = selectedPlan?.companyLogo || selectedCashOffer?.companyLogo || '';
  const cashOnlyPlan = selectedPlan && isCashOnlyInstallment(selectedPlan.monthlyInstallment);

  const handleVariantChange = (vIdx) => {
    const next = vIdx === '' || vIdx === 'all' ? null : Number(vIdx);
    setSelectedVariantIndex(next);
    setSelectedPlanIndex(0);
    setSelectedEntryIdx(0);
    setSelectedCashOfferKey('');
  };

  const handleEntryChange = (idx) => {
    const entry = planEntries[Number(idx)];
    if (!entry) return;
    setSelectedEntryIdx(Number(idx));
    setSelectedPlanIndex(entry.planIndex);
    if (entry.variantIndex !== null && entry.variantIndex !== undefined) {
      setSelectedVariantIndex(entry.variantIndex);
    }
  };

  const updateFormField = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setFormField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePlanSelection = () => {
    if (variantCount > 0 && (selectedVariantIndex === null || selectedVariantIndex === undefined)) {
      showError('Please select a product variant (specification) before submitting.');
      return false;
    }

    if (planEntries.length > 0 && !selectedPlan) {
      showError('Please select a payment plan before submitting.');
      return false;
    }

    if (needsCashPartnerPick && !selectedCashOffer) {
      showError('Please select which partner cash price you want to apply for.');
      return false;
    }

    return true;
  };

  const validateDetailsStep = () => {
    if (!validatePlanSelection()) return false;

    if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
      showError('Please fill in all required fields (Name, Email, Phone)');
      return false;
    }

    if (!formData.cnic?.trim()) {
      showError('Please enter your CNIC number');
      return false;
    }

    if (!formData.city?.trim()) {
      showError('Please select your city');
      return false;
    }

    if (!formData.area?.trim()) {
      showError('Please select or enter your area');
      return false;
    }

    if (!formData.address?.trim()) {
      showError('Please provide your address');
      return false;
    }

    return true;
  };

  const validateCheckout = () => {
    if (!validateDetailsStep()) {
      return false;
    }

    if (!termsAccepted) {
      showError('Please accept the terms and conditions to place your order');
      return false;
    }

    return true;
  };

  const handleContinueToCheckout = (e) => {
    e.preventDefault();
    if (!validateDetailsStep()) return;
    setCurrentStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const areaOptions = getAreasForCity(formData.city);
  const showAreaSelect = areaOptions.length > 0;

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);

    if (!validateCheckout()) {
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();

      const planId = plan?.installmentPlanId || plan?._id;
      
      if (!planId) {
        throw new Error('Plan ID is missing. Please try again.');
      }

      const applicationData = {
        installmentPlanId: planId,
        selectedPlanIndex: selectedPlan ? selectedPlanIndex : undefined,
        selectedVariantIndex: selectedVariantIndex,
        applyForCashOnly: Boolean(!selectedPlan && selectedCashOffer),
        selectedPartnerId: selectedCashOffer?.partnerId || selectedPlan?.partnerId || undefined,
        selectedCashPrice: selectedCashOffer?.price || undefined,
        selectedPartnerCompanyName: selectedCashOffer?.companyName || selectedPlan?.companyName || undefined,
        applicationNote: buildApplicationNote(formData),
        userInfo: {
          address: formData.address,
          city: formData.city,
          state: formData.area || formData.state,
          zip: formData.zip,
          country: formData.country,
          occupation: formData.occupation,
          employerName: formData.employerName,
          employerAddress: formData.employerAddress,
          jobTitle: formData.jobTitle,
          monthlyIncome: formData.monthlyIncome,
          otherIncomeSources: formData.otherIncomeSources,
          workContactNumber: formData.alternativePhone || formData.workContactNumber,
        }
      };

      const response = await fetch(`${backendBaseUrl}/applyInstallment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Show detailed error message from backend
        const errorMessage = data.message || data.error || 'Failed to submit application';
        throw new Error(errorMessage);
      }

      showSuccess('Your order has been placed successfully! Our agent will contact you soon.');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Application submit error:', err);
      showError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full size-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan Not Found</h2>
          <p className="text-gray-600 mb-6">
            The installment plan you're looking for doesn't exist.
          </p>
          <div className="flex gap-3 justify-center">
            <button type="button"
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button type="button"
              onClick={() => router.push('/installments')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Browse Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Validate that plan has required fields
  const planId = plan?.installmentPlanId || plan?._id;
  if (!planId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Plan Data</h2>
          <p className="text-gray-600 mb-6">
            This installment plan is missing required information. Please contact support or try another plan.
          </p>
          <div className="flex gap-3 justify-center">
            <button type="button"
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button type="button"
              onClick={() => router.push('/installments')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Browse Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toasts={toasts} onClose={removeToast} />
      <SEO
        title={`Apply for ${plan.productName} Installment | Madadgaar`}
        description={`Apply for easy installment plan for ${plan.productName}. Flexible monthly payments with minimal down payment.`}
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-content max-w-6xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-responsive-xl font-bold text-gray-900">
              {currentStep === 'checkout' ? 'Checkout' : 'Apply for Installment Plan'}
            </h1>
            <p className="text-gray-600 mt-2 text-responsive-sm">
              {currentStep === 'checkout'
                ? 'Review your details and confirm your application'
                : 'Complete the form below to apply for this installment plan'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {currentStep === 'checkout' ? (
              <div className="p-4 sm:p-6 lg:p-8">
                <InstallmentCheckoutStep
                  plan={plan}
                  formData={formData}
                  selectedVariant={selectedVariant}
                  selectedPlan={selectedPlan}
                  selectedCashOffer={selectedCashOffer}
                  cashOnlyPlan={cashOnlyPlan}
                  summaryCashDisplay={summaryCashDisplay}
                  summaryCashPrice={summaryCashPrice}
                  resolvedPartnerName={resolvedPartnerName}
                  partnerLogo={partnerLogo}
                  termsAccepted={termsAccepted}
                  setTermsAccepted={setTermsAccepted}
                  loading={loading}
                  onBack={() => {
                    setCurrentStep('details');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 xl:divide-x divide-gray-100">
            {/* Plan Summary Sidebar */}
            <div className="xl:col-span-4 bg-gray-50/60 p-4 sm:p-6 lg:p-8">
              <div className="xl:sticky xl:top-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Plan Summary</h2>
                
                <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={plan.productImages?.[0] || '/placeholder.png'}
                    alt={plan.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{plan.productName}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {plan.description || plan.city || 'Installment product'}
                </p>

                {showVariantPicker && (
                  <div className="mb-4">
                    <label htmlFor="apply-variant" className="block text-sm font-medium text-gray-700 mb-2">
                      Select variant / specification *
                    </label>
                    <select
                      id="apply-variant"
                      value={selectedVariantIndex === null ? '' : String(selectedVariantIndex)}
                      onChange={(e) => handleVariantChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      {variantCount > 1 && <option value="">Choose specification…</option>}
                      {plan.variants.map((v, vIdx) => (
                        <option key={vIdx} value={vIdx}>
                          {v.variantName}
                          {isPartnerOwnedVariant(v) ? ' (Partner offer)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {planEntries.length > 0 && (
                  <div className="mb-4">
                    <label htmlFor="apply-plan-entry" className="block text-sm font-medium text-gray-700 mb-2">
                      Select payment plan *
                    </label>
                    <select
                      id="apply-plan-entry"
                      value={selectedEntryIdx}
                      onChange={(e) => handleEntryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      {planEntries.map((entry, idx) => (
                        <option key={`${entry.variantIndex ?? 'r'}-${entry.planIndex}-${idx}`} value={idx}>
                          {formatApplyEntryLabel(plan, entry)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {showVariantPicker && selectedVariantIndex === null && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                    Choose a variant to see payment plans and partner pricing for that option.
                  </p>
                )}

                {needsCashPartnerPick && (
                  <div className="mb-4">
                    <label htmlFor="apply-cash-partner" className="block text-sm font-medium text-gray-700 mb-2">
                      Select partner cash price *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Multiple partners offer this variant at different cash prices. Choose the offer you want to apply for.
                    </p>
                    <select
                      id="apply-cash-partner"
                      value={selectedCashOfferKey}
                      onChange={(e) => setSelectedCashOfferKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      {variantCashOffers.map((o) => (
                        <option key={cashOfferKey(o)} value={cashOfferKey(o)}>
                          {o.companyName}  PKR {Number(o.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3 space-y-2">
                      {variantCashOffers.map((o) => {
                        const key = cashOfferKey(o);
                        const active = key === selectedCashOfferKey;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedCashOfferKey(key)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                              active
                                ? 'border-[rgb(183,36,42)] bg-red-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <span className="font-semibold text-gray-900">{o.companyName}</span>
                            <span className="block mt-0.5">
                              <CashPriceDisplay display={getOfferPriceDisplay(plan, o)} size="sm" inline />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showVariantPicker && selectedVariantIndex !== null && planEntries.length === 0 && !needsCashPartnerPick && (
                  <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
                    No cash or installment pricing for this variant yet. Try another specification.
                  </p>
                )}

                {(selectedPlan || selectedCashOffer || (selectedVariantIndex !== null && selectedVariant)) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    {selectedVariant && (
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-gray-600 shrink-0">Variant:</span>
                        <span className="font-semibold text-gray-900 text-right">
                          {selectedVariant.variantName}
                          {isPartnerOwnedVariant(selectedVariant) && (
                            <span className="block text-xs font-normal text-violet-700">Partner offer</span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 text-sm border-t border-red-100 pt-2">
                      <span className="text-gray-600">Offered by:</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        {partnerLogo ? (
                          <img src={partnerLogo} alt="" className="h-5 w-auto object-contain" />
                        ) : null}
                        {resolvedPartnerName}
                      </span>
                    </div>
                    {selectedCashOffer && !selectedPlan && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Application type:</span>
                        <span className="font-semibold text-gray-900">Cash price request</span>
                      </div>
                    )}
                    {selectedPlan && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-semibold text-gray-900">{selectedPlan.planName}</span>
                        </div>
                        <div className="flex justify-between items-start gap-2 text-sm">
                          <span className="text-gray-600 shrink-0">Cash price:</span>
                          <CashPriceDisplay display={summaryCashDisplay} size="sm" inline className="text-right" />
                        </div>
                        {!cashOnlyPlan && Number(selectedPlan.installmentPrice) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total payable:</span>
                            <span className="font-semibold text-gray-900">
                              PKR {Number(selectedPlan.installmentPrice).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {Number(selectedPlan.downPayment || 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Down payment:</span>
                            <span className="font-semibold text-red-600">
                              PKR {Number(selectedPlan.downPayment).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {!cashOnlyPlan && Number(selectedPlan.monthlyInstallment) > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Monthly:</span>
                              <span className="font-semibold text-red-600">
                                PKR {Number(selectedPlan.monthlyInstallment).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tenure:</span>
                              <span className="font-semibold text-gray-900">
                                {selectedPlan.tenureMonths} months
                              </span>
                            </div>
                          </>
                        )}
                        {Number(selectedPlan.interestRatePercent) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Rate:</span>
                            <span className="font-semibold text-gray-900">
                              {selectedPlan.interestRatePercent}% {selectedPlan.interestType}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {(selectedCashOffer || (!selectedPlan && selectedVariant)) && summaryCashPrice > 0 && (
                      <div className="flex justify-between items-start gap-2 text-sm">
                        <span className="text-gray-600 shrink-0">Your selected cash price:</span>
                        <CashPriceDisplay display={summaryCashDisplay} size="sm" inline className="text-right" />
                      </div>
                    )}
                    {resolvedPartnerId && (
                      <p className="text-xs text-gray-500 pt-1 border-t border-red-100">
                        Request will be sent to <strong>{resolvedPartnerName}</strong>
                        {selectedCashOffer && !selectedPlan ? ' for this cash offer' : ''}.
                      </p>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Application Form */}
            <div className="xl:col-span-8">
              <form onSubmit={handleContinueToCheckout} className="divide-y divide-gray-100">
                <FormSection title="Personal Information" description="Your contact and delivery details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className={labelClass}>Full Name *</label>
                      <input id="name" type="text" name="name" value={formData.name} disabled
                        className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClass}>Email *</label>
                      <input id="email" type="email" name="email" value={formData.email} disabled
                        className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>Phone Number *</label>
                      <input id="phone" type="tel" name="phone" value={formData.phone} onChange={updateFormField}
                        required className={inputClass} placeholder="+92 300 1234567" />
                    </div>
                    <div>
                      <label htmlFor="alternativePhone" className={labelClass}>
                        Alternative Number <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input id="alternativePhone" type="tel" name="alternativePhone" value={formData.alternativePhone}
                        onChange={updateFormField} className={inputClass} placeholder="+92 321 0000000" />
                    </div>
                    <div>
                      <label htmlFor="cnic" className={labelClass}>CNIC Number *</label>
                      <input id="cnic" type="text" name="cnic" value={formData.cnic} onChange={updateFormField}
                        required maxLength={15} className={inputClass} placeholder="35202-1234567-1" />
                    </div>
                    <div>
                      <label htmlFor="city" className={labelClass}>Select City *</label>
                      <select id="city" name="city" value={formData.city} required
                        onChange={(e) => { updateFormField(e); setFormField('area', ''); }}
                        className={`${inputClass} bg-white`}>
                        <option value="">Select a city</option>
                        {cities.map((c) => (
                          <option key={c.value} value={c.value}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="area" className={labelClass}>Select Area *</label>
                      {showAreaSelect ? (
                        <select id="area" name="area" value={formData.area} onChange={updateFormField} required
                          className={`${inputClass} bg-white`}>
                          <option value="">Select area</option>
                          {areaOptions.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      ) : (
                        <input id="area" type="text" name="area" value={formData.area} onChange={updateFormField}
                          required disabled={!formData.city} className={`${inputClass} disabled:bg-gray-50`}
                          placeholder={formData.city ? 'Enter your area' : 'Select a city first'} />
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className={labelClass}>Address *</label>
                      <textarea id="address" name="address" value={formData.address} onChange={updateFormField}
                        required rows={2} className={inputClass} placeholder="Enter your complete address" />
                    </div>
                    <div>
                      <label htmlFor="state" className={labelClass}>State / Province</label>
                      <input id="state" type="text" name="state" value={formData.state} onChange={updateFormField}
                        className={inputClass} placeholder="e.g., Punjab, Sindh" />
                    </div>
                    <div>
                      <label htmlFor="zip" className={labelClass}>Postal Code</label>
                      <input id="zip" type="text" name="zip" value={formData.zip} onChange={updateFormField}
                        className={inputClass} placeholder="e.g., 54000" />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Employment Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="occupation" className={labelClass}>Occupation</label>
                      <input id="occupation" type="text" name="occupation" value={formData.occupation}
                        onChange={updateFormField} className={inputClass} placeholder="e.g., Software Engineer" />
                    </div>
                    <div>
                      <label htmlFor="jobTitle" className={labelClass}>Job Title</label>
                      <input id="jobTitle" type="text" name="jobTitle" value={formData.jobTitle}
                        onChange={updateFormField} className={inputClass} placeholder="e.g., Senior Developer" />
                    </div>
                    <div>
                      <label htmlFor="employerName" className={labelClass}>Employer Name</label>
                      <input id="employerName" type="text" name="employerName" value={formData.employerName}
                        onChange={updateFormField} className={inputClass} placeholder="Company name" />
                    </div>
                    <div>
                      <label htmlFor="workContactNumber" className={labelClass}>Work Contact Number</label>
                      <input id="workContactNumber" type="tel" name="workContactNumber" value={formData.workContactNumber}
                        onChange={updateFormField} className={inputClass} placeholder="+92 300 1234567" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="employerAddress" className={labelClass}>Employer Address</label>
                      <textarea id="employerAddress" name="employerAddress" value={formData.employerAddress}
                        onChange={updateFormField} rows={2} className={inputClass} placeholder="Company address" />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Financial Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="monthlyIncome" className={labelClass}>Monthly Income</label>
                      <input id="monthlyIncome" type="number" name="monthlyIncome" value={formData.monthlyIncome}
                        onChange={updateFormField} className={inputClass} placeholder="e.g., 50000" />
                    </div>
                    <div>
                      <label htmlFor="otherIncomeSources" className={labelClass}>Other Income Sources</label>
                      <input id="otherIncomeSources" type="text" name="otherIncomeSources" value={formData.otherIncomeSources}
                        onChange={updateFormField} className={inputClass} placeholder="e.g., Freelancing, Business" />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Additional Information">
                  <div>
                    <label htmlFor="applicationNote" className={labelClass}>
                      Application Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea id="applicationNote" name="applicationNote" value={formData.applicationNote}
                      onChange={updateFormField} rows={3} className={inputClass}
                      placeholder="Any additional information you'd like to share..." />
                  </div>
                </FormSection>

                <div className="p-5 sm:p-6 bg-gray-50">
                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <button type="button" onClick={() => router.back()}
                      className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
                      Cancel
                    </button>
                    <button type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium flex items-center justify-center gap-2">
                      Continue to checkout
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyInstallment;
