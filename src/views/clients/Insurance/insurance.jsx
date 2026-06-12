// src/pages/InsuranceInfo.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { backendBaseUrl } from "../../../constants/apiUrl";
import SEO from "../../../components/SEO";
import OfferBanner from "../../../components/OfferBanner";
import LoadingPage from "../../../compontents/Loader";
import OurPartners from "../OverPartener";
import AnimatedSection from "../../../components/AnimatedSection";

const ACCENT = "rgb(183,36,42)";
const API = (backendBaseUrl || "").replace(/\/$/, "");

const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function InsuranceInfo() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter and search state
  const [search, setSearch] = useState("");
  const [selectedPolicyType, setSelectedPolicyType] = useState("");
  const [selectedPlanStatus, setSelectedPlanStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    let mounted = true;
    const fetchPlans = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/getAllInsurancePlansPublic?limit=1000`, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            // Don't send Authorization header for public endpoint
          },
        });
        
        const payload = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
        
        if (!res.ok) {
          // Handle different error status codes
          if (res.status === 401 || res.status === 403) {
            throw new Error('Access denied. Please try refreshing the page.');
          } else if (res.status === 404) {
            throw new Error('Insurance plans endpoint not found.');
          } else if (res.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(payload?.message || `Failed to load insurance plans (${res.status})`);
          }
        }
        
        if (!payload.success) {
          throw new Error(payload?.message || 'Failed to load insurance plans');
        }
        
        if (mounted) {
          const data = payload.data || [];
          setPlans(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (mounted) {
          // Show user-friendly error message
          const errorMsg = err.message || "Network error  could not fetch insurance plans.";
          setError(errorMsg);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchPlans();
    return () => { mounted = false; };
  }, []);

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Policy type filter
      if (selectedPolicyType && plan.policyType !== selectedPolicyType) {
        return false;
      }
      
      // Plan status filter
      if (selectedPlanStatus && plan.planStatus !== selectedPlanStatus) {
        return false;
      }
      
      // Search filter
      const searchLower = search.toLowerCase();
      if (searchLower) {
        return (
          (plan.planName || "").toLowerCase().includes(searchLower) ||
          (plan.registeredCompanyName || "").toLowerCase().includes(searchLower) ||
          (plan.policyType || "").toLowerCase().includes(searchLower) ||
          (plan.planId || "").toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [plans, search, selectedPolicyType, selectedPlanStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + pageSize);

  // Get unique policy types and plan statuses
  const policyTypes = useMemo(() => {
    const types = new Set();
    plans.forEach((p) => {
      if (p.policyType) types.add(p.policyType);
    });
    return Array.from(types).sort();
  }, [plans]);

  const planStatuses = useMemo(() => {
    const statuses = new Set();
    plans.forEach((p) => {
      if (p.planStatus) statuses.add(p.planStatus);
    });
    return Array.from(statuses).sort();
  }, [plans]);

  const handleApplyClick = () => {
    router.push("/insurance");
  };

  const handleSubmitClaim = () => {
    router.push("/submit-claim");
  };

  const getPolicyDetails = (plan) => {
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Insurance Services",
    "name": "Madadgaar Insurance Support",
    "description": "Claim with confidencePakistan's most trusted insurance support. Compare life insurance, health insurance, motor insurance, travel insurance, property insurance, and Takaful plans, along with fast and transparent claim support.",
    "url": "https://madadgaar.com.pk/insurance",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Madadgaar Expert Partner",
      "url": "https://madadgaar.com.pk"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PKR",
      "description": "Free insurance comparison and claim support services"
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-gray-50">
      <SEO
        title="Madadgaar Insurance Support | Claim with confidencePakistan's most trusted insurance support"
        description="Explore Insurance Services – Compare, Select & Apply. Madadgaar helps you compare life insurance, health insurance, motor insurance, travel insurance, property insurance, and Takaful plans, along with fast and transparent claim support  all on one easy-to-use platform."
        keywords="insurance pakistan, car insurance pakistan, life insurance, health insurance, property insurance, insurance claims, insurance companies pakistan, motor insurance, family insurance, takaful pakistan, insurance support pakistan"
        canonicalUrl="https://madadgaar.com.pk/insurance"
        structuredData={structuredData}
      />
      
      {/* top banner */}
      <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
      <div className="bg-white border-b">
        <div className="container-content max-w-6xl section-padding flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
              Madadgaar Insurance Support | Claim with confidencePakistan's most trusted insurance support
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">
              Protect your life, health, and assets with tailored insurance plans. <a href="/faq#insurance" className="text-red-600 hover:text-red-700 font-semibold">View insurance FAQs</a> or <a href="/contact" className="text-red-600 hover:text-red-700 font-semibold">contact our support team</a>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button type="button"
              onClick={handleSubmitClaim}
              className="w-full sm:w-auto btn-primary rounded-full text-xs sm:text-sm font-medium min-h-touch"
            >
              Submit Claim / Maturity
            </button>
            <button type="button"
              onClick={handleApplyClick}
              className="w-full sm:w-auto btn-primary rounded-full text-xs sm:text-sm font-medium min-h-touch"
            >
              Browse Plans
            </button>
          </div>
        </div>
      </div>
      </AnimatedSection>

      <OfferBanner />

      {/* main content */}
      <div className="container-content max-w-6xl section-padding space-y-4 sm:space-y-6 lg:space-y-8">
        {/* hero card */}
        <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft border border-gray-100 p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
              Secure your future with the right coverage
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-3">
              We offer reliable support for addressing insurance-related issues. We partner with leading insurance companies to ensure your concerns are handled effectively and fairly. Our platform is dedicated to providing swift resolutions, helping you navigate the complexities of insurance claims with ease.
            </p>

            <div className="mt-3 sm:mt-4 lg:mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                  Quick Approvals
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-800">
                  Simple documentation and fast processing for eligible customers.
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                  Flexible Plans
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-800">
                  Choose coverage and tenure according to your need & budget.
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                  Trusted Partners
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-800">
                  Insurance plans from reputed banks & insurance providers.
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button type="button"
                onClick={handleApplyClick}
                className="btn-primary rounded-full text-sm font-medium"
              >
                Browse Insurance Plans
              </button>
              <button type="button"
                onClick={handleSubmitClaim}
                className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium border-2 hover:bg-gray-50 transition min-h-touch"
                style={{ borderColor: ACCENT, color: ACCENT }}
              >
                Submit Claim / Maturity Request
              </button>
            </div>
          </div>
        </div>
        </AnimatedSection>

        {/* Search and Filters */}
        {plans.length > 0 && (
          <AnimatedSection animation="fadeInUp" delay={120} className="w-full">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search plans by name, company, or policy type..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              {/* Policy Type Filter */}
              <select
                value={selectedPolicyType}
                onChange={(e) => {
                  setSelectedPolicyType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Policy Types</option>
                {policyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              {/* Plan Status Filter */}
              <select
                value={selectedPlanStatus}
                onChange={(e) => {
                  setSelectedPlanStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {planStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {paginatedPlans.length} of {filteredPlans.length} plans
            </div>
          </div>
          </AnimatedSection>
        )}

        {/* Insurance Plans Grid */}
        {error ? (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Plans</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Plans Found</h3>
            <p className="text-sm text-gray-600">
              {search || selectedPolicyType || selectedPlanStatus
                ? "Try adjusting your filters to see more plans."
                : "No insurance plans available at the moment."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedPlans.map((plan, index) => {
                const policyDetails = getPolicyDetails(plan);
                const premium = policyDetails?.premiumAmount || policyDetails?.annualPremium || policyDetails?.contributionAmount;
                const sumAssured = policyDetails?.sumAssured || policyDetails?.annualCoverageLimit || policyDetails?.sumCovered;
                const isLifeInsurance = plan.policyType === 'Life';
                const isMotorInsurance = plan.policyType === 'Motor';
                
                return (
                  <AnimatedSection key={plan._id} animation="fadeInUp" delay={index * 80} className="w-full">
                  <div
                    className="bg-white rounded-xl shadow-soft border border-gray-100 card-hover-lift overflow-hidden group"
                  >
                    {/* Plan Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {plan.planImage ? (
                        <img
                          src={plan.planImage}
                          alt={plan.planName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-blue-500/20 flex items-center justify-center" style={{ display: plan.planImage ? 'none' : 'flex' }}>
                        <div className="text-4xl">🛡️</div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          plan.planStatus === 'Active' ? 'bg-green-100 text-green-800' :
                          plan.planStatus === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.planStatus || 'Active'}
                        </span>
                      </div>
                      
                      {/* Policy Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                          {plan.policyType}
                        </span>
                      </div>
                    </div>
                    
                    {/* Plan Details */}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {plan.planName}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {plan.registeredCompanyName}
                      </p>
                      
                      {plan.description && (
                        <div 
                          className="text-xs text-gray-500 mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: plan.description }}
                        />
                      )}
                      
                      {/* Life Insurance Static Fields */}
                      {isLifeInsurance ? (
                        <div className="space-y-2 mb-4 bg-gradient-to-br from-red-50 to-orange-50 p-3 rounded-lg border border-red-100">
                          <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Life Insurance Details</div>
                          {policyDetails?.premiumAmount && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Premium Amount:</span>
                              <span className="font-semibold text-red-600">{formatCurrency(policyDetails.premiumAmount)}</span>
                            </div>
                          )}
                          {policyDetails?.paymentFrequency && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Payment Frequency:</span>
                              <span className="font-semibold text-gray-900">{policyDetails.paymentFrequency}</span>
                            </div>
                          )}
                          {policyDetails?.sumAssured && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Sum Assured:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(policyDetails.sumAssured)}</span>
                            </div>
                          )}
                          {plan.policyTerm && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Policy Term:</span>
                              <span className="font-semibold text-gray-900">{plan.policyTerm}</span>
                            </div>
                          )}
                          {plan.estimatedMaturity && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Estimated Maturity:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(plan.estimatedMaturity)}</span>
                            </div>
                          )}
                        </div>
                      ) : isMotorInsurance ? (
                        /* Motor Insurance Static Fields */
                        <div className="space-y-2 mb-4 bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-100">
                          <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Motor Insurance Details</div>
                          {policyDetails?.motorType && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Vehicle Type:</span>
                              <span className="font-semibold text-gray-900">{policyDetails.motorType}</span>
                            </div>
                          )}
                          {policyDetails?.coverageType && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Coverage Type:</span>
                              <span className="font-semibold text-gray-900">{policyDetails.coverageType}</span>
                            </div>
                          )}
                          {(policyDetails?.vehicleValueRange?.min || policyDetails?.vehicleValueRangeMin) && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Vehicle Value:</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(policyDetails.vehicleValueRange?.min || policyDetails.vehicleValueRangeMin)} - {formatCurrency(policyDetails.vehicleValueRange?.max || policyDetails.vehicleValueRangeMax)}
                              </span>
                            </div>
                          )}
                          {policyDetails?.annualPremium && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Annual Premium:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(policyDetails.annualPremium)}</span>
                            </div>
                          )}
                          
                          {/* Coverage Checkmarks */}
                          {(plan.motorInsurancePlan?.thirdPartyCoverage?.length > 0 || 
                            plan.motorInsurancePlan?.totalLossCoverage?.length > 0 || 
                            plan.motorInsurancePlan?.ownDamageCoverage?.length > 0) && (
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <div className="text-xs font-semibold text-gray-700 mb-2">Coverage Includes:</div>
                              <div className="space-y-1">
                                {plan.motorInsurancePlan?.thirdPartyCoverage?.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-green-600">✓</span>
                                    <span className="text-gray-600">Third Party ({plan.motorInsurancePlan.thirdPartyCoverage.length} items)</span>
                                  </div>
                                )}
                                {plan.motorInsurancePlan?.totalLossCoverage?.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-green-600">✓</span>
                                    <span className="text-gray-600">Total Loss ({plan.motorInsurancePlan.totalLossCoverage.length} items)</span>
                                  </div>
                                )}
                                {plan.motorInsurancePlan?.ownDamageCoverage?.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-green-600">✓</span>
                                    <span className="text-gray-600">Own Damage ({plan.motorInsurancePlan.ownDamageCoverage.length} items)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Quick Stats for Non-Life Insurance */
                        <div className="space-y-2 mb-4">
                          {sumAssured && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Coverage:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(sumAssured)}</span>
                            </div>
                          )}
                          {premium && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Premium:</span>
                              <span className="font-semibold text-red-600">{formatCurrency(premium)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-4">
                        <button type="button"
                          onClick={() => router.push(`/insurance/${plan._id}`)}
                          className="w-full btn-primary rounded-lg font-semibold text-sm min-h-touch"
                        >
                          View Details
                        </button>
                        <button type="button"
                          onClick={() => router.push(`/insurance/${plan._id}/apply`)}
                          className="w-full px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition text-sm min-h-touch"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                  </AnimatedSection>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* How it works */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 md:p-7">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            How the Insurance Process Works
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col">
              <div className="size-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                1
              </div>
              <div className="mt-2 font-medium text-gray-800">Browse Plans</div>
              <div className="mt-1 text-xs text-gray-600">
                Compare insurance plans from different companies.
              </div>
            </div>
            <div className="flex flex-col">
              <div className="size-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                2
              </div>
              <div className="mt-2 font-medium text-gray-800">Select & Apply</div>
              <div className="mt-1 text-xs text-gray-600">
                Choose the plan that best fits your needs and apply online.
              </div>
            </div>
            <div className="flex flex-col">
              <div className="size-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                3
              </div>
              <div className="mt-2 font-medium text-gray-800">Get Approved</div>
              <div className="mt-1 text-xs text-gray-600">
                Our team reviews your application and connects you with the insurance company.
              </div>
            </div>
            <div className="flex flex-col">
              <div className="size-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                4
              </div>
              <div className="mt-2 font-medium text-gray-800">Policy Issued</div>
              <div className="mt-1 text-xs text-gray-600">
                After verification and payment, your insurance policy gets issued.
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs md:text-sm text-gray-600">
              Need help with claims or maturity requests? Submit your request and our team will assist you.
            </p>
            <button type="button"
              onClick={handleSubmitClaim}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Submit Claim / Maturity
            </button>
          </div>
        </section>
      </div>
      
      <OurPartners />
    </div>
  );
}
