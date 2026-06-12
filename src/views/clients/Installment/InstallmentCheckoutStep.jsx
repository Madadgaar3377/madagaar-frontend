import React from 'react';
import Link from 'next/link';
import CashPriceDisplay from '../../../components/CashPriceDisplay';
import { ReviewBlock } from './InstallmentApplyShared';

const formatRs = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

export default function InstallmentCheckoutStep({
  plan,
  formData,
  selectedVariant,
  selectedPlan,
  selectedCashOffer,
  cashOnlyPlan,
  summaryCashDisplay,
  summaryCashPrice,
  resolvedPartnerName,
  partnerLogo,
  termsAccepted,
  setTermsAccepted,
  loading,
  onBack,
  onSubmit,
}) {
  const productLine = [plan?.productName, selectedVariant?.variantName].filter(Boolean).join(' | ');

  const advanceAmount = selectedPlan
    ? Number(selectedPlan.downPayment || 0)
    : Number(selectedCashOffer?.price || summaryCashPrice || 0);

  const monthlyAmount = selectedPlan ? Number(selectedPlan.monthlyInstallment || 0) : 0;
  const tenureMonths = selectedPlan ? Number(selectedPlan.tenureMonths || 0) : 0;
  const totalDealValue = selectedPlan
    ? Number(selectedPlan.installmentPrice || 0) || Number(selectedPlan.downPayment || 0) + monthlyAmount * tenureMonths
    : Number(summaryCashPrice || selectedCashOffer?.price || 0);

  const isInstallment = Boolean(selectedPlan && !cashOnlyPlan && monthlyAmount > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Review applicant details */}
      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Review your application</h2>
            <p className="text-sm text-gray-500 mt-1">Confirm all details before placing your order</p>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <ReviewBlock
              title="Personal Information"
              rows={[
                { label: 'Full name', value: formData.name },
                { label: 'Email', value: formData.email },
                { label: 'Phone', value: formData.phone },
                { label: 'Alternative number', value: formData.alternativePhone },
                { label: 'CNIC', value: formData.cnic },
                { label: 'City', value: formData.city },
                { label: 'Area', value: formData.area },
                { label: 'State / Province', value: formData.state },
                { label: 'Postal code', value: formData.zip },
                { label: 'Address', value: formData.address, full: true },
              ]}
            />
            <ReviewBlock
              title="Employment Information"
              rows={[
                { label: 'Occupation', value: formData.occupation },
                { label: 'Job title', value: formData.jobTitle },
                { label: 'Employer name', value: formData.employerName },
                { label: 'Work contact', value: formData.workContactNumber },
                { label: 'Employer address', value: formData.employerAddress, full: true },
              ]}
            />
            <ReviewBlock
              title="Financial Information"
              rows={[
                { label: 'Monthly income', value: formData.monthlyIncome ? `PKR ${Number(formData.monthlyIncome).toLocaleString()}` : '' },
                { label: 'Other income sources', value: formData.otherIncomeSources },
              ]}
            />
            <ReviewBlock
              title="Additional notes"
              rows={[{ label: 'Notes', value: formData.applicationNote, full: true }]}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
        >
          ← Edit application details
        </button>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-5">
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden lg:sticky lg:top-6">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your order</h2>
            <p className="text-sm text-gray-500 mt-1">Order details</p>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex gap-4">
              <div className="size-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={plan?.productImages?.[0] || '/placeholder.png'}
                  alt={plan?.productName || 'Product'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 leading-snug">{productLine || plan?.productName}</p>
                {selectedPlan?.planName && (
                  <p className="text-sm text-gray-500 mt-1">Plan: {selectedPlan.planName}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  {partnerLogo ? (
                    <img src={partnerLogo} alt="" className="h-4 w-auto object-contain" />
                  ) : null}
                  <span>{resolvedPartnerName}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-red-100 bg-red-50/50 p-4 space-y-2.5 text-sm">
              {selectedVariant && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Variant</span>
                  <span className="font-semibold text-gray-900 text-right">{selectedVariant.variantName}</span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Offered by</span>
                <span className="font-semibold text-gray-900">{resolvedPartnerName}</span>
              </div>
              {selectedCashOffer && !selectedPlan && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Application type</span>
                  <span className="font-semibold text-gray-900">Cash price request</span>
                </div>
              )}
              {isInstallment ? (
                <>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">Advance amount</span>
                    <span className="font-semibold text-gray-900">{formatRs(advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">Monthly amount</span>
                    <span className="font-semibold text-red-600 text-right">
                      {formatRs(monthlyAmount)} / for {tenureMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">Total deal value</span>
                    <span className="font-semibold text-gray-900">{formatRs(totalDealValue)}</span>
                  </div>
                  {advanceAmount > 0 && (
                    <div className="flex justify-between gap-3 pt-2 border-t border-red-100">
                      <span className="font-semibold text-gray-800">Total advance</span>
                      <span className="font-bold text-red-600">{formatRs(advanceAmount)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-start gap-3">
                  <span className="text-gray-600 shrink-0">Your selected cash price</span>
                  <CashPriceDisplay display={summaryCashDisplay} size="sm" inline className="text-right" />
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 border border-gray-200 rounded-lg p-3 bg-gray-50">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span>
                By clicking Place Order, I have read and accepted the{' '}
                <Link href="/terms-and-conditions" className="text-red-600 hover:underline" target="_blank">
                  terms and conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-red-600 hover:underline" target="_blank">
                  privacy policy
                </Link>{' '}
                of Madadgaar.
                <span className="text-red-600"> *</span>
              </span>
            </label>

            <div className="flex flex-col gap-3 pt-1">
              <button
                type="button"
                onClick={onSubmit}
                disabled={loading || !termsAccepted}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full size-5 border-b-2 border-white" />
                    Placing order…
                  </>
                ) : (
                  'Place order'
                )}
              </button>
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition lg:hidden"
              >
                Back to application
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Our agent will contact you within 24–48 hours after you place your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
