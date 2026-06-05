import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  getOfferPriceDisplay,
  getProductPriceDisplay,
  formatApplyEntryLabel,
  findApplyEntryIndex,
  cashOfferKey,
  findCashOfferByKey,
  isPartnerOwnedVariant,
  isCashOnlyInstallment,
} from '../../../utils/installmentPricing';

const ApplyInstallment = () => {
  const { id } = useParams(); // installment plan ID
  const navigate = useNavigate();
  const currentUser = getUser();
  
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [plan, setPlan] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [selectedEntryIdx, setSelectedEntryIdx] = useState(0);
  /** Which partner cash offer (when no installment plan on variant) */
  const [selectedCashOfferKey, setSelectedCashOfferKey] = useState('');
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    // User Info
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || '',
    address: currentUser?.Address || '',
    city: '',
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
      navigate('/account');
      return;
    }

    // Extract indices from URL
    const params = new URLSearchParams(window.location.search);
    const pIdx = params.get('planIndex');
    const vIdx = params.get('variantIndex');
    if (pIdx !== null && !Number.isNaN(Number(pIdx))) setSelectedPlanIndex(parseInt(pIdx, 10));
    if (vIdx !== null && !Number.isNaN(Number(vIdx))) setSelectedVariantIndex(parseInt(vIdx, 10));

    fetchPlanDetails();
  }, [fetchPlanDetails, navigate]);

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
    : selectedVariantIndex !== null
    ? getProductPriceDisplay(plan, selectedVariantIndex)
    : getProductPriceDisplay(plan);
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

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showError('Please fill in all required fields (Name, Email, Phone)');
      return false;
    }

    if (!formData.address || !formData.city) {
      showError('Please provide your address and city');
      return false;
    }

    const variantCount = plan?.variants?.length || 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();

      // Ensure we have the installmentPlanId
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
        applicationNote: formData.applicationNote,
        userInfo: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          occupation: formData.occupation,
          employerName: formData.employerName,
          employerAddress: formData.employerAddress,
          jobTitle: formData.jobTitle,
          monthlyIncome: formData.monthlyIncome,
          otherIncomeSources: formData.otherIncomeSources,
          workContactNumber: formData.workContactNumber,
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

      showSuccess('Application submitted successfully! Our agent will contact you soon.');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
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
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button type="button"
              onClick={() => navigate('/installments')}
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
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button type="button"
              onClick={() => navigate('/installments')}
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
        <div className="container-content max-w-5xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-responsive-xl font-bold text-gray-900">
              Apply for Installment Plan
            </h1>
            <p className="text-gray-600 mt-2 text-responsive-sm">Complete the form below to apply for this installment plan</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Summary</h2>
                
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
                          {o.companyName} — PKR {Number(o.price).toLocaleString()}
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
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
                {/* Personal Information */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={updateFormField}
                        required
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={updateFormField}
                        required
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={updateFormField}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+92 300 1234567"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={updateFormField}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your city"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea id="address"
                        name="address"
                        value={formData.address}
                        onChange={updateFormField}
                        required
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your complete address"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input id="state"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Punjab, Sindh"
                      />
                    </div>

                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input id="zip"
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., 54000"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation
                      </label>
                      <input id="occupation"
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Software Engineer"
                      />
                    </div>

                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <input id="jobTitle"
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Senior Developer"
                      />
                    </div>

                    <div>
                      <label htmlFor="employerName" className="block text-sm font-medium text-gray-700 mb-2">
                        Employer Name
                      </label>
                      <input id="employerName"
                        type="text"
                        name="employerName"
                        value={formData.employerName}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="workContactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Work Contact Number
                      </label>
                      <input id="workContactNumber"
                        type="tel"
                        name="workContactNumber"
                        value={formData.workContactNumber}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+92 300 1234567"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="employerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Employer Address
                      </label>
                      <textarea id="employerAddress"
                        name="employerAddress"
                        value={formData.employerAddress}
                        onChange={updateFormField}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Company address"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income
                      </label>
                      <input id="monthlyIncome"
                        type="number"
                        name="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., 50000"
                      />
                    </div>

                    <div>
                      <label htmlFor="otherIncomeSources" className="block text-sm font-medium text-gray-700 mb-2">
                        Other Income Sources
                      </label>
                      <input id="otherIncomeSources"
                        type="text"
                        name="otherIncomeSources"
                        value={formData.otherIncomeSources}
                        onChange={updateFormField}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Freelancing, Business"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                  <div>
                    <label htmlFor="applicationNote" className="block text-sm font-medium text-gray-700 mb-2">
                      Application Notes (Optional)
                    </label>
                    <textarea id="applicationNote"
                      name="applicationNote"
                      value={formData.applicationNote}
                      onChange={updateFormField}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full size-5 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    By submitting this application, you agree to our terms and conditions. Our agent will contact you within 24-48 hours.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyInstallment;
