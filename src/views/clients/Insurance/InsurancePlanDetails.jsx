"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";
import OurPartners from "../OverPartener";
import SEO from "../../../components/SEO";

const API = (backendBaseUrl || "").replace(/\/$/, "");

const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function InsurancePlanDetails({ initialPlan = null, planId: planIdProp = null }) {
  const { id: routeId } = useParams();
  const id = planIdProp || routeId;
  const router = useRouter();

  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(initialPlan == null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || initialPlan != null) return;
    
    let cancelled = false;
    
    const fetchPlanDetails = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch plan by ID
        const res = await fetch(`${API}/getInsurancePlan/${id}`);
        const body = await res.json();
        
        if (!res.ok || !body.success) {
          throw new Error(body.message || 'Failed to load insurance plan');
        }
        
        if (!cancelled) {
          setPlan(body.data);
        }
      } catch (err) {
        console.error('Insurance plan fetch error:', err);
        if (!cancelled) {
          setError(err.message || "Failed to load insurance plan");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPlanDetails();

    return () => {
      cancelled = true;
    };
  }, [id, initialPlan]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl p-6 border shadow-sm text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-gray-800 mb-2">Error Loading Insurance Plan</div>
          <div className="text-sm text-gray-600 mb-6">{error}</div>
          <div className="flex gap-3 justify-center">
            <button type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Go Back
            </button>
            <button type="button"
              onClick={() => router.push('/insurance')}
              className="px-6 py-2 rounded-md bg-[rgb(183,36,42)] text-white hover:bg-red-700"
            >
              Browse Insurance Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-gray-600">No insurance plan selected.</div>
      </div>
    );
  }

  // Get policy-specific details based on policyType
  const getPolicyDetails = () => {
    const policyType = plan.policyType;
    switch (policyType) {
      case 'Life':
        return plan.lifeInsurancePlan;
      case 'Health':
        return plan.healthInsurancePlan;
      case 'Motor':
        return plan.motorInsurancePlan;
      case 'Travel':
        return plan.travelInsurancePlan;
      case 'Property':
        return plan.propertyInsurancePlan;
      case 'Takaful':
        return plan.takafulPlan;
      default:
        return null;
    }
  };

  const policyDetails = getPolicyDetails();

  return (
    <>
      <SEO />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 section-padding">
        <div className="container-content">
          {/* Back Button */}
          <button type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Insurance Plans
          </button>

          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[rgb(183,36,42)] to-red-700 p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {plan.planName || "Insurance Plan"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-red-100">
                    <span className="flex items-center gap-1">
                      <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                      {plan.registeredCompanyName || "Insurance Company"}
                    </span>
                    {plan.policyType && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20`}>
                          {plan.policyType}
                        </span>
                      </>
                    )}
                    {plan.planStatus && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          plan.planStatus === 'Active' ? 'bg-green-500' : 
                          plan.planStatus === 'Limited' ? 'bg-yellow-500' : 
                          'bg-gray-500'
                        }`}>
                          {plan.planStatus}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {plan.policyType === 'Life' ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-6 bg-gradient-to-br from-red-50 to-orange-50 border-b">
                {policyDetails?.premiumAmount && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Premium Amount</div>
                    <div className="text-base sm:text-lg font-bold text-red-600 mt-1">
                      {formatCurrency(policyDetails.premiumAmount)}
                    </div>
                  </div>
                )}
                {policyDetails?.paymentFrequency && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Payment Frequency</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {policyDetails.paymentFrequency}
                    </div>
                  </div>
                )}
                {policyDetails?.sumAssured && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Sum Assured</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(policyDetails.sumAssured)}
                    </div>
                  </div>
                )}
                {plan.policyTerm && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Policy Term</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {plan.policyTerm}
                    </div>
                  </div>
                )}
                {plan.estimatedMaturity && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Estimated Maturity</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(plan.estimatedMaturity)}
                    </div>
                  </div>
                )}
              </div>
            ) : plan.policyType === 'Motor' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-b">
                {policyDetails?.motorType && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Vehicle Type</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {policyDetails.motorType}
                    </div>
                  </div>
                )}
                {policyDetails?.coverageType && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Coverage Type</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {policyDetails.coverageType}
                    </div>
                  </div>
                )}
                {(policyDetails?.vehicleValueRange?.min || policyDetails?.vehicleValueRangeMin) && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Vehicle Value</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(policyDetails.vehicleValueRange?.min || policyDetails.vehicleValueRangeMin)} - {formatCurrency(policyDetails.vehicleValueRange?.max || policyDetails.vehicleValueRangeMax)}
                    </div>
                  </div>
                )}
                {policyDetails?.annualPremium && (
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-semibold">Annual Premium</div>
                    <div className="text-base sm:text-lg font-bold text-purple-600 mt-1">
                      {formatCurrency(policyDetails.annualPremium)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
                {policyDetails?.sumAssured && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Sum Assured</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(policyDetails.sumAssured)}
                    </div>
                  </div>
                )}
                {policyDetails?.premiumAmount && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Premium</div>
                    <div className="text-base sm:text-lg font-bold text-red-600 mt-1">
                      {formatCurrency(policyDetails.premiumAmount)}
                    </div>
                    {policyDetails.paymentFrequency && (
                      <div className="text-xs text-gray-500 mt-0.5">({policyDetails.paymentFrequency})</div>
                    )}
                  </div>
                )}
                {policyDetails?.annualCoverageLimit && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Coverage Limit</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(policyDetails.annualCoverageLimit)}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Status</div>
                  <div className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    plan.planStatus === 'Active' ? 'bg-green-100 text-green-800' : 
                    plan.planStatus === 'Limited' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.planStatus || 'Active'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image & Quick Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Image */}
              {plan.planImage && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <img
                    src={plan.planImage}
                    alt={`${plan.planName || "Insurance"} Plan - ${plan.registeredCompanyName || "Company"}`}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Contact Information */}
              {plan.creatorInformation && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3 text-sm">
                    {plan.creatorInformation.name && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Company</div>
                        <div className="text-gray-900 font-medium">{plan.creatorInformation.name}</div>
                      </div>
                    )}
                    {plan.creatorInformation.phoneNumber && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Phone</div>
                        <a href={`tel:${plan.creatorInformation.phoneNumber}`} className="text-blue-600 hover:underline">
                          {plan.creatorInformation.phoneNumber}
                        </a>
                      </div>
                    )}
                    {plan.creatorInformation.whatsappNumber && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">WhatsApp</div>
                        <a href={`https://wa.me/${plan.creatorInformation.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                          {plan.creatorInformation.whatsappNumber}
                        </a>
                      </div>
                    )}
                    {plan.creatorInformation.email && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Email</div>
                        <a href={`mailto:${plan.creatorInformation.email}`} className="text-blue-600 hover:underline break-all">
                          {plan.creatorInformation.email}
                        </a>
                      </div>
                    )}
                    {plan.creatorInformation.address && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Address</div>
                        <div className="text-gray-900">{plan.creatorInformation.address}</div>
                      </div>
                    )}
                    {plan.creatorInformation.officialWebsite && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Website</div>
                        <a 
                          href={plan.creatorInformation.officialWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline break-all"
                        >
                          {plan.creatorInformation.officialWebsite}
                        </a>
                      </div>
                    )}
                    {plan.creatorInformation.contactPerson?.fullName && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Contact Person</div>
                        <div className="text-gray-900">{plan.creatorInformation.contactPerson.fullName}</div>
                        {plan.creatorInformation.contactPerson.designation && (
                          <div className="text-xs text-gray-600">{plan.creatorInformation.contactPerson.designation}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Plan Documents */}
              {plan.planDocuments && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Documents</h3>
                  <div className="space-y-3">
                    {plan.planDocuments.productBrochure && (
                      <a
                        href={plan.planDocuments.productBrochure}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                      >
                        <svg className="size-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Product Brochure</span>
                      </a>
                    )}
                    {plan.planDocuments.policyWording && (
                      <a
                        href={plan.planDocuments.policyWording}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                      >
                        <svg className="size-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Policy Wording</span>
                      </a>
                    )}
                    {plan.planDocuments.rateCard && (
                      <a
                        href={plan.planDocuments.rateCard}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                      >
                        <svg className="size-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Rate Card</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {plan.description && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="size-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h3>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2"
                    dangerouslySetInnerHTML={{ __html: plan.description }}
                  />
                </div>
              )}

              {/* Motor Insurance Plan Data */}
              {plan.policyType === 'Motor' && plan.motorInsurancePlan && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="size-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Motor Insurance Plan Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {plan.motorInsurancePlan.motorType && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Vehicle Type</div>
                        <div className="text-base font-bold text-gray-900 mt-1">
                          {plan.motorInsurancePlan.motorType}
                        </div>
                      </div>
                    )}
                    {plan.motorInsurancePlan.coverageType && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Coverage Type</div>
                        <div className="text-base font-bold text-gray-900 mt-1">
                          {plan.motorInsurancePlan.coverageType}
                        </div>
                      </div>
                    )}
                    {(plan.motorInsurancePlan.vehicleValueRange?.min || plan.motorInsurancePlan.vehicleValueRangeMin) && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Vehicle Value Range</div>
                        <div className="text-base font-bold text-gray-900 mt-1">
                          {formatCurrency(plan.motorInsurancePlan.vehicleValueRange?.min || plan.motorInsurancePlan.vehicleValueRangeMin)} - {formatCurrency(plan.motorInsurancePlan.vehicleValueRange?.max || plan.motorInsurancePlan.vehicleValueRangeMax)}
                        </div>
                      </div>
                    )}
                    {plan.motorInsurancePlan.annualPremium && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Annual Premium</div>
                        <div className="text-base font-bold text-purple-600 mt-1">
                          {formatCurrency(plan.motorInsurancePlan.annualPremium)}
                        </div>
                      </div>
                    )}
                    {plan.motorInsurancePlan.theftCoverage !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Theft Coverage</div>
                        <div className="text-base font-bold text-gray-900 mt-1">
                          {plan.motorInsurancePlan.theftCoverage ? 'Yes' : 'No'}
                        </div>
                      </div>
                    )}
                    {plan.motorInsurancePlan.floodCoverage !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Flood Coverage</div>
                        <div className="text-base font-bold text-gray-900 mt-1">
                          {plan.motorInsurancePlan.floodCoverage ? 'Yes' : 'No'}
                        </div>
                      </div>
                    )}
                    {plan.motorInsurancePlan.naturalCalamities !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Natural Calamities</div>
                        <div className="text-base font-bold text-gray-900 mt-1">
                          {plan.motorInsurancePlan.naturalCalamities ? 'Yes' : 'No'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Motor Insurance Coverage Cards */}
              {plan.policyType === 'Motor' && plan.motorInsurancePlan && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="size-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Coverage Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Third Party Coverage Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <svg className="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Third Party</h4>
                      </div>
                      {plan.motorInsurancePlan.thirdPartyCoverage && plan.motorInsurancePlan.thirdPartyCoverage.length > 0 ? (
                        <ul className="space-y-2">
                          {plan.motorInsurancePlan.thirdPartyCoverage.map((coverage, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>{coverage}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No third party coverage selected</p>
                      )}
                    </div>

                    {/* Total Loss Coverage Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Total Loss</h4>
                      </div>
                      {plan.motorInsurancePlan.totalLossCoverage && plan.motorInsurancePlan.totalLossCoverage.length > 0 ? (
                        <ul className="space-y-2">
                          {plan.motorInsurancePlan.totalLossCoverage.map((coverage, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{coverage}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No total loss coverage selected</p>
                      )}
                    </div>

                    {/* Own Damage Coverage Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <svg className="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Own Damage</h4>
                      </div>
                      {plan.motorInsurancePlan.ownDamageCoverage && plan.motorInsurancePlan.ownDamageCoverage.length > 0 ? (
                        <ul className="space-y-2">
                          {plan.motorInsurancePlan.ownDamageCoverage.map((coverage, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{coverage}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No own damage coverage selected</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Policy-Specific Details */}
              {policyDetails && plan.policyType !== 'Motor' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="size-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {plan.policyType} Plan Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(policyDetails).map(([key, value]) => {
                      if (value === null || value === undefined || value === '') return null;
                      if (Array.isArray(value) && value.length === 0) return null;
                      if (typeof value === 'object' && !Array.isArray(value)) return null;
                      
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                          <div className="text-xs text-gray-500 uppercase font-semibold">{label}</div>
                          <div className="text-base font-bold text-gray-900 mt-1">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Plan ID</div>
                    <div className="text-sm text-gray-900 font-mono mt-1">{plan.planId || plan._id || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Policy Type</div>
                    <div className="text-sm text-gray-900 mt-1">{plan.policyType || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Company</div>
                    <div className="text-sm text-gray-900 mt-1">{plan.registeredCompanyName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Created</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-6 sm:p-8 mt-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Ready to Apply?</h3>
                <p className="text-red-100 text-sm sm:text-base">Start your insurance application process now</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button"
                  onClick={() => router.push(`/insurance/${id}/apply`)}
                  className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Apply Now
                </button>
                <button type="button"
                  onClick={() => router.push('/contact')}
                  className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OurPartners />
    </>
  );
}
