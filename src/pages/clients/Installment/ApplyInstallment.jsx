import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthToken, getUser, isAuthenticated } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import SEO from '../../../components/SEO';
import { Toast, useToast } from '../../../components/Toast';

const ApplyInstallment = () => {
  const { id } = useParams(); // installment plan ID
  const navigate = useNavigate();
  const currentUser = getUser();
  
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [plan, setPlan] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
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

      console.log('Fetched plan:', planData); // Debug log
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
    if (pIdx !== null) setSelectedPlanIndex(parseInt(pIdx));
    if (vIdx !== null) setSelectedVariantIndex(parseInt(vIdx));

    // Fetch installment plan details
    fetchPlanDetails();
  }, [fetchPlanDetails, navigate]);

  const handleChange = (e) => {
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

      console.log('Submitting application with planId:', planId); // Debug log

      const applicationData = {
        installmentPlanId: planId,
        selectedPlanIndex: selectedPlanIndex,
        selectedVariantIndex: selectedVariantIndex, // Pass the variant index
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

      console.log('Application data:', applicationData); // Debug log

      const response = await fetch(`${backendBaseUrl}/applyInstallment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      console.log('Backend response:', data); // Debug log

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
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
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button
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
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button
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

  const selectedVariant = selectedVariantIndex !== null ? plan.variants?.[selectedVariantIndex] : null;
  const selectedPlan = (selectedVariant && selectedVariant.paymentPlans?.length > 0)
    ? selectedVariant.paymentPlans[selectedPlanIndex]
    : (plan.paymentPlans?.[selectedPlanIndex] || null);

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
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-responsive-xl font-bold text-gray-900">
              Apply for Installment Plan
            </h1>
            <p className="text-gray-600 mt-2 text-responsive-sm">Complete the form below to apply for this installment plan</p>
          </div>

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && plan && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <details>
                <summary className="cursor-pointer font-semibold">Debug: Plan Object Fields</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify({
                    installmentPlanId: plan.installmentPlanId,
                    _id: plan._id,
                    productName: plan.productName,
                    hasPaymentPlans: !!plan.paymentPlans?.length
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}


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

                <h3 className="font-semibold text-gray-900 mb-2">
                  {plan.productName} 
                  {selectedVariant && <span className="text-[rgb(183,36,42)]"> - {selectedVariant.variantName}</span>}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>

                {/* Payment Plan Selector */}
                {plan.paymentPlans && plan.paymentPlans.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Payment Plan
                    </label>
                    <select
                      value={selectedPlanIndex}
                      onChange={(e) => setSelectedPlanIndex(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      {(selectedVariant && selectedVariant.paymentPlans?.length > 0 ? selectedVariant.paymentPlans : plan.paymentPlans).map((paymentPlan, index) => (
                        <option key={index} value={index}>
                          {paymentPlan.planName} - {paymentPlan.tenureMonths} months
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedPlan && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-semibold text-gray-900">{selectedPlan.planName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-gray-900">PKR {(selectedPlan?.installmentPrice || selectedVariant?.price || plan.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Down Payment:</span>
                      <span className="font-semibold text-red-600">PKR {selectedPlan.downPayment?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly:</span>
                      <span className="font-semibold text-red-600">PKR {selectedPlan.monthlyInstallment?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tenure:</span>
                      <span className="font-semibold text-gray-900">{selectedPlan.tenureMonths} months</span>
                    </div>
                    {selectedPlan.interestRatePercent > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Interest:</span>
                        <span className="font-semibold text-gray-900">{selectedPlan.interestRatePercent}% {selectedPlan.interestType}</span>
                      </div>
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
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+92 300 1234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your city"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your complete address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Punjab, Sindh"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Senior Developer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employer Name
                      </label>
                      <input
                        type="text"
                        name="employerName"
                        value={formData.employerName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Contact Number
                      </label>
                      <input
                        type="tel"
                        name="workContactNumber"
                        value={formData.workContactNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+92 300 1234567"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employer Address
                      </label>
                      <textarea
                        name="employerAddress"
                        value={formData.employerAddress}
                        onChange={handleChange}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income
                      </label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., 50000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Income Sources
                      </label>
                      <input
                        type="text"
                        name="otherIncomeSources"
                        value={formData.otherIncomeSources}
                        onChange={handleChange}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Notes (Optional)
                    </label>
                    <textarea
                      name="applicationNote"
                      value={formData.applicationNote}
                      onChange={handleChange}
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
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
