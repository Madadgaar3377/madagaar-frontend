import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";
import OurPartners from "../OverPartener";
import SEO from "../../../components/SEO";
import ShareButtons from "../../../components/ShareButtons";

const API = (backendBaseUrl || "").replace(/\/$/, "");

// Helper to sanitize and clean HTML for display
const sanitizeHtml = (html) => {
  if (!html) return "";
  
  // Replace &quot; with actual quotes
  let cleaned = html
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
  
  return cleaned;
};

// Helper to extract plain text for SEO
const extractPlainText = (html) => {
  if (!html) return "";
  
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
};

const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function LoanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    let cancelled = false;
    
    const fetchLoanDetails = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch all loans
        const res = await fetch(`${API}/getAllLoans`);
        const body = await res.json();
        
        if (!res.ok || !body.success) {
          throw new Error(body.message || 'Failed to load loan plans');
        }
        
        const allLoans = body.data || [];
        
        // Find the loan with matching ID (check both _id and planId)
        const foundLoan = allLoans.find(loan => 
          loan._id === id || 
          loan.planId === id ||
          loan._id?.toString() === id ||
          loan.planId?.toString() === id
        );
        
        if (!foundLoan) {
          throw new Error("Loan plan not found");
        }
        
        if (!cancelled) {
          setPlan(foundLoan);
        }
      } catch (err) {
        console.error('Loan fetch error:', err);
        if (!cancelled) {
          setError(err.message || "Failed to load loan plan");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLoanDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl p-6 border shadow-sm text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-gray-800 mb-2">Error Loading Loan</div>
          <div className="text-sm text-gray-600 mb-6">{error}</div>
          <div className="flex gap-3 justify-center">
            <button type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Go Back
            </button>
            <button type="button"
              onClick={() => navigate('/loans')}
              className="px-6 py-2 rounded-md bg-[rgb(183,36,42)] text-white hover:bg-red-700"
            >
              Browse Loans
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-gray-600">No loan plan selected.</div>
      </div>
    );
  }

  const tenureDisplay = plan.minTenure && plan.maxTenure 
    ? `${plan.minTenure}-${plan.maxTenure} ${plan.tenureUnit || 'Months'}`
    : plan.minTenure
    ? `${plan.minTenure}+ ${plan.tenureUnit || 'Months'}`
    : plan.maxTenure
    ? `Up to ${plan.maxTenure} ${plan.tenureUnit || 'Months'}`
    : "Not specified";

  const amountDisplay = plan.minFinancingAmount && plan.maxFinancingAmount
    ? `${formatCurrency(plan.minFinancingAmount)} - ${formatCurrency(plan.maxFinancingAmount)}`
    : plan.minFinancingAmount
    ? `From ${formatCurrency(plan.minFinancingAmount)}`
    : plan.maxFinancingAmount
    ? `Up to ${formatCurrency(plan.maxFinancingAmount)}`
    : "Not specified";

  return (
    <>
      <SEO
        title={`${plan.productName || 'Loan Details'} | Madadgaar`}
        description={extractPlainText(plan.description) || [plan.productName, plan.bankName, plan.majorCategory, plan.indicativeRate && `Rate: ${plan.indicativeRate}`, 'View details & apply on Madadgaar.'].filter(Boolean).join(' · ')}
        canonicalUrl={`https://madadgaar.com.pk/loans/${id}`}
        ogImage={plan.planImage}
        noIndex={false}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 section-padding">
        <div className="container-content">
          {/* Back Button */}
          <button type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Loans
          </button>

          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[rgb(183,36,42)] to-red-700 p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {plan.productName || "Loan Plan"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-red-100">
                    <span className="flex items-center gap-1">
                      <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                      {plan.bankName || plan.createrinformation?.name || "Financial Institution"}
                    </span>
                    {plan.majorCategory && (
                      <>
                        <span>•</span>
                        <span>{plan.majorCategory}</span>
                      </>
                    )}
                    {plan.financingType && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          plan.financingType === 'Islamic' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {plan.financingType}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Financing Amount</div>
                <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">{amountDisplay}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Tenure</div>
                <div className="text-base sm:text-lg font-bold text-gray-900 mt-1">{tenureDisplay}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Interest Rate</div>
                <div className="text-base sm:text-lg font-bold text-red-600 mt-1">{plan.indicativeRate || "Contact for rate"}</div>
                {plan.rateType && <div className="text-xs text-gray-500 mt-0.5">({plan.rateType})</div>}
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Status</div>
                <div className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
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
                    alt={`${plan.productName || "Loan"} - ${plan.bankName || "Financial"} ${plan.majorCategory || "Loan"} Plan in Pakistan`}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Contact Card */}
              {plan.createrinformation && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3 text-sm">
                    {plan.createrinformation.name && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Provider</div>
                        <div className="text-gray-900 font-medium">{plan.createrinformation.name}</div>
                      </div>
                    )}
                    {plan.createrinformation.phoneNumber && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Phone</div>
                        <a href={`tel:${plan.createrinformation.phoneNumber}`} className="text-blue-600 hover:underline">
                          {plan.createrinformation.phoneNumber}
                        </a>
                      </div>
                    )}
                    {plan.createrinformation.email && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Email</div>
                        <a href={`mailto:${plan.createrinformation.email}`} className="text-blue-600 hover:underline break-all">
                          {plan.createrinformation.email}
                        </a>
                      </div>
                    )}
                    {plan.createrinformation.address && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Address</div>
                        <div className="text-gray-900">{plan.createrinformation.address}</div>
                      </div>
                    )}
                    {plan.createrinformation.officalWebsite && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Website</div>
                        <a 
                          href={plan.createrinformation.officalWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline break-all"
                        >
                          {plan.createrinformation.officalWebsite}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Plan Document */}
              {plan.planDocument && (
                <a
                  href={plan.planDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-blue-50 border-2 border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 size-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">Download Plan Document</div>
                      <div className="text-xs text-gray-600">View detailed brochure</div>
                    </div>
                    <svg className="size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
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
                    className="loan-description prose prose-sm sm:prose lg:prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(plan.description) }}
                  />
                  <style>{`
                    .loan-description {
                      line-height: 1.75;
                      color: #374151;
                    }
                    .loan-description p {
                      margin-bottom: 1em;
                      line-height: 1.75;
                    }
                    .loan-description span {
                      line-height: inherit;
                    }
                    .loan-description strong, .loan-description b {
                      font-weight: 600;
                      color: #1f2937;
                    }
                    .loan-description em, .loan-description i {
                      font-style: italic;
                    }
                    .loan-description ul, .loan-description ol {
                      margin: 1em 0;
                      padding-left: 1.5em;
                    }
                    .loan-description li {
                      margin-bottom: 0.5em;
                    }
                    .loan-description h1, .loan-description h2, .loan-description h3, 
                    .loan-description h4, .loan-description h5, .loan-description h6 {
                      font-weight: 700;
                      margin-top: 1.5em;
                      margin-bottom: 0.75em;
                      color: #111827;
                    }
                    .loan-description h1 { font-size: 2em; }
                    .loan-description h2 { font-size: 1.5em; }
                    .loan-description h3 { font-size: 1.25em; }
                    .loan-description a {
                      color: #2563eb;
                      text-decoration: underline;
                    }
                    .loan-description a:hover {
                      color: #1d4ed8;
                    }
                    .loan-description img {
                      max-width: 100%;
                      height: auto;
                      border-radius: 0.5rem;
                      margin: 1em 0;
                    }
                    .loan-description table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1em 0;
                    }
                    .loan-description th, .loan-description td {
                      border: 1px solid #e5e7eb;
                      padding: 0.5em;
                      text-align: left;
                    }
                    .loan-description th {
                      background-color: #f9fafb;
                      font-weight: 600;
                    }
                    /* Remove MS Word specific classes styling */
                    .loan-description .MsoNormal {
                      margin: 0;
                    }
                    .loan-description [class^="Mso"] {
                      line-height: inherit !important;
                    }
                  `}</style>
                </div>
              )}

              {/* Eligibility Criteria */}
              {plan.eligibility && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="size-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Eligibility Criteria
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plan.eligibility.minAge && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Min Age</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">{plan.eligibility.minAge} years</div>
                      </div>
                    )}
                    {plan.eligibility.maxAge && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Max Age</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">{plan.eligibility.maxAge} years</div>
                      </div>
                    )}
                    {plan.eligibility.minIncome && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Min Income</div>
                        <div className="text-lg font-bold text-green-600 mt-1">{formatCurrency(plan.eligibility.minIncome)}/month</div>
                      </div>
                    )}
                    {plan.eligibility.employmentType && plan.eligibility.employmentType.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Employment Type</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {plan.eligibility.employmentType.map((type, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Required Documents */}
                  {plan.eligibility.requiredDocuments && plan.eligibility.requiredDocuments.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Required Documents:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {plan.eligibility.requiredDocuments.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Target Audience */}
              {plan.targetAudience && plan.targetAudience.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.targetAudience.map((audience, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Plan ID</div>
                    <div className="text-sm text-gray-900 font-mono mt-1">{plan.planId || plan._id || 'N/A'}</div>
                  </div>
                  {plan.subCategory && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Sub Category</div>
                      <div className="text-sm text-gray-900 mt-1">{plan.subCategory}</div>
                    </div>
                  )}
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
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Last Updated</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString('en-US', { 
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
                <p className="text-red-100 text-sm sm:text-base">Start your loan application process now</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button"
                  onClick={() => navigate(`/loans/${id}/apply`)}
                  className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Apply Now
                </button>
                <button type="button"
                  onClick={() => navigate('/contact')}
                  className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
          <ShareButtons
            url={id ? `https://madadgaar.com.pk/loans/${id}` : ""}
            title={plan?.productName || "Loan plan"}
            label="Share this loan"
          />
        </div>
      </div>

      <OurPartners />
    </>
  );
}
