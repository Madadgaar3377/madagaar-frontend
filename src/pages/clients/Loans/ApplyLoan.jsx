import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthToken, getUser, isAuthenticated } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import SEO from '../../../components/SEO';
import { Toast, useToast } from '../../../components/Toast';

const ApplyLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [plan, setPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    fatherOrHusbandName: '',
    cnicNumber: currentUser?.cnicNumber || '',
    cnicExpiryDate: '',
    dateOfBirth: '',
    maritalStatus: '',
    numberOfDependents: '',
    mobileNumber: currentUser?.phoneNumber || '',
    whatsappNumber: currentUser?.WhatsappNumber || '',
    email: currentUser?.email || '',
    currentAddress: currentUser?.Address || '',
    city: '',
    residenceType: '',
    incomeType: '',
    employerName: '',
    designation: '',
    jobStatus: '',
    monthlyNetSalary: '',
    businessName: '',
    natureOfBusiness: '',
    yearsInBusiness: '',
    ntnAvailable: false,
    approxMonthlyIncome: '',
    bankNames: '',
    accountType: '',
    existingLoanType: '',
    existingLoanBank: '',
    existingLoanInstallment: '',
    loanType: '',
    requiredAmount: '',
    preferredTenure: '',
    financingPreference: '',
    preferredMode: '',
    shariahTermsAccepted: false,
    securityOffered: '',
    estimatedValue: '',
    creditCheckConsent: false,
    informationConfirmed: false,
    applicationNote: '',
  });

  const fetchPlanDetails = useCallback(async () => {
    try {
      setLoadingPlan(true);
      const response = await fetch(`${backendBaseUrl}/getAllLoans`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load loan plans');
      }

      const allLoans = data.data || [];
      const foundLoan = allLoans.find(loan => 
        loan._id === id || loan.planId === id ||
        loan._id?.toString() === id || loan.planId?.toString() === id
      );

      if (!foundLoan) {
        throw new Error('Loan plan not found');
      }

      setPlan(foundLoan);
      
      // Auto-fill loan requirement fields
      setFormData(prev => ({
        ...prev,
        loanType: foundLoan.majorCategory?.includes('Home') ? 'Home' 
                : foundLoan.majorCategory?.includes('Auto') ? 'Auto'
                : foundLoan.majorCategory?.includes('Business') ? 'Business'
                : foundLoan.majorCategory?.includes('Personal') ? 'Personal'
                : '',
        requiredAmount: foundLoan.minFinancingAmount || '',
        preferredTenure: foundLoan.minTenure || '',
        financingPreference: foundLoan.financingType || '',
      }));
    } catch (err) {
      showError(err.message || 'Failed to load loan plan');
    } finally {
      setLoadingPlan(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/account');
      return;
    }
    fetchPlanDetails();
  }, [fetchPlanDetails, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.cnicNumber) {
          showError('Please fill in required applicant information');
          return false;
        }
        if (!formData.mobileNumber || !formData.email) {
          showError('Please fill in required contact information');
          return false;
        }
        break;
      case 2:
        if (!formData.incomeType) {
          showError('Please select your income type');
          return false;
        }
        break;
      case 3:
        if (!formData.loanType || !formData.requiredAmount) {
          showError('Please fill in loan requirement details');
          return false;
        }
        break;
      case 5:
        if (!formData.creditCheckConsent || !formData.informationConfirmed) {
          showError('Please accept all declarations');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);

    try {
      const token = getAuthToken();
      const planIdToSend = plan?.planId || plan?._id;

      if (!planIdToSend) {
        throw new Error('Plan ID is missing');
      }

      const applicationData = {
        planId: planIdToSend,
        applicantInfo: {
          fullName: formData.fullName,
          fatherOrHusbandName: formData.fatherOrHusbandName,
          cnicNumber: formData.cnicNumber,
          cnicExpiryDate: formData.cnicExpiryDate || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          maritalStatus: formData.maritalStatus || undefined,
          numberOfDependents: formData.numberOfDependents ? parseInt(formData.numberOfDependents) : undefined,
        },
        contactInfo: {
          mobileNumber: formData.mobileNumber,
          whatsappNumber: formData.whatsappNumber,
          email: formData.email,
          currentAddress: formData.currentAddress,
          city: formData.city,
          residenceType: formData.residenceType || undefined,
        },
        incomeDetails: {
          incomeType: formData.incomeType,
          employerName: formData.employerName || undefined,
          designation: formData.designation || undefined,
          jobStatus: formData.jobStatus || undefined,
          monthlyNetSalary: formData.monthlyNetSalary ? parseFloat(formData.monthlyNetSalary) : undefined,
          businessName: formData.businessName || undefined,
          natureOfBusiness: formData.natureOfBusiness || undefined,
          yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : undefined,
          ntnAvailable: formData.ntnAvailable,
          approxMonthlyIncome: formData.approxMonthlyIncome ? parseFloat(formData.approxMonthlyIncome) : undefined,
        },
        bankingDetails: {
          bankNames: formData.bankNames ? formData.bankNames.split(',').map(b => b.trim()) : [],
          accountType: formData.accountType || undefined,
          existingLoan: formData.existingLoanType ? {
            loanType: formData.existingLoanType,
            bankName: formData.existingLoanBank,
            monthlyInstallment: formData.existingLoanInstallment ? parseFloat(formData.existingLoanInstallment) : undefined,
          } : undefined,
        },
        loanRequirement: {
          loanType: formData.loanType,
          requiredAmount: parseFloat(formData.requiredAmount),
          preferredTenure: formData.preferredTenure ? parseInt(formData.preferredTenure) : undefined,
          financingPreference: formData.financingPreference || undefined,
        },
        islamicFinancing: formData.preferredMode ? {
          preferredMode: formData.preferredMode,
          shariahTermsAccepted: formData.shariahTermsAccepted,
        } : undefined,
        security: formData.securityOffered ? {
          securityOffered: formData.securityOffered,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        } : undefined,
        declarations: {
          creditCheckConsent: formData.creditCheckConsent,
          informationConfirmed: formData.informationConfirmed,
          signedAt: new Date(),
        },
        applicationNote: formData.applicationNote || undefined,
      };

      const response = await fetch(`${backendBaseUrl}/applyLoan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit application');
      }

      showSuccess('Loan application submitted successfully! Our agent will contact you soon.');
      
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
          <p className="text-gray-600 text-lg">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <>
        <Toast toasts={toasts} onClose={removeToast} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loan Plan Not Found</h2>
            <p className="text-gray-600 mb-6">The loan plan you're looking for doesn't exist.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/loans')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Browse Loans
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const steps = [
    { number: 1, title: 'Applicant & Contact', desc: 'Personal & address info' },
    { number: 2, title: 'Income', desc: 'Employment' },
    { number: 3, title: 'Loan', desc: 'Requirements' },
    { number: 4, title: 'Banking', desc: 'Security' },
    { number: 5, title: 'Review', desc: 'Submit' },
  ];

  return (
    <>
      <Toast toasts={toasts} onClose={removeToast} />
      <SEO
        title={`Apply for ${plan.productName} | Madadgaar`}
        description={`Apply for ${plan.productName} loan from ${plan.bankName}. Easy application process with competitive rates.`}
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Apply for Loan
            </h1>
            <p className="text-gray-600 mt-2">Complete the application in simple steps</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Loan Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h2>
                
                {plan.planImage && (
                  <div className="aspect-video w-full mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={plan.planImage}
                      alt={plan.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-2">{plan.productName}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.bankName}</p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Financing Amount:</span>
                    <span className="font-semibold text-gray-900 text-xs">
                      {plan.minFinancingAmount && plan.maxFinancingAmount 
                        ? `${formatCurrency(plan.minFinancingAmount)} - ${formatCurrency(plan.maxFinancingAmount)}`
                        : 'Variable'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tenure:</span>
                    <span className="font-semibold text-gray-900">
                      {plan.minTenure && plan.maxTenure 
                        ? `${plan.minTenure}-${plan.maxTenure} ${plan.tenureUnit || 'Months'}`
                        : 'Flexible'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-semibold text-red-600">{plan.indicativeRate || 'Contact for rate'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className={`font-semibold ${plan.financingType === 'Islamic' ? 'text-green-600' : 'text-blue-600'}`}>
                      {plan.financingType}
                    </span>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Application Progress</div>
                  <div className="space-y-2">
                    {steps.map((step) => (
                      <div key={step.number} className={`flex items-center gap-2 text-sm ${
                        step.number === currentStep ? 'text-red-600 font-semibold' : 
                        step.number < currentStep ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          step.number === currentStep ? 'bg-red-600 text-white' : 
                          step.number < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200'
                        }`}>
                          {step.number < currentStep ? '✓' : step.number}
                        </div>
                        <div>
                          <div>{step.title}</div>
                          <div className="text-xs text-gray-500">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-2">
              {/* Progress Steps Bar */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                <div className="flex items-center">
                  {steps.map((step, idx) => (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                          step.number === currentStep 
                            ? 'bg-red-600 text-white ring-4 ring-red-100 scale-110' 
                            : step.number < currentStep 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step.number < currentStep ? '✓' : step.number}
                        </div>
                        <div className="hidden sm:block text-xs text-center mt-2 text-gray-600 font-medium">
                          {step.title}
                        </div>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`h-1 flex-1 mx-2 transition ${
                          step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
                {/* Step 1: Applicant & Contact Information */}
                {currentStep === 1 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Applicant & Contact Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Father/Husband Name
                        </label>
                        <input
                          type="text"
                          name="fatherOrHusbandName"
                          value={formData.fatherOrHusbandName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CNIC Number *
                        </label>
                        <input
                          type="text"
                          name="cnicNumber"
                          value={formData.cnicNumber}
                          onChange={handleChange}
                          required
                          placeholder="12345-1234567-1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CNIC Expiry Date
                        </label>
                        <input
                          type="date"
                          name="cnicExpiryDate"
                          value={formData.cnicExpiryDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marital Status
                        </label>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Dependents
                        </label>
                        <input
                          type="number"
                          name="numberOfDependents"
                          value={formData.numberOfDependents}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      {/* Contact Information Section */}
                      <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          required
                          placeholder="+92 300 1234567"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={handleChange}
                          placeholder="+92 300 1234567"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Address
                        </label>
                        <textarea
                          name="currentAddress"
                          value={formData.currentAddress}
                          onChange={handleChange}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Residence Type
                        </label>
                        <select
                          name="residenceType"
                          value={formData.residenceType}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select Type</option>
                          <option value="Owned">Owned</option>
                          <option value="Rented">Rented</option>
                          <option value="Family">Family</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Income Details */}
                {currentStep === 2 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Employment / Income Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Income Type *
                        </label>
                        <select
                          name="incomeType"
                          value={formData.incomeType}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select Income Type</option>
                          <option value="Salaried">Salaried</option>
                          <option value="Business">Business</option>
                          <option value="Self-Employed">Self-Employed</option>
                        </select>
                      </div>

                      {formData.incomeType === 'Salaried' && (
                        <>
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
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Designation
                            </label>
                            <input
                              type="text"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Job Status
                            </label>
                            <select
                              name="jobStatus"
                              value={formData.jobStatus}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select Status</option>
                              <option value="Permanent">Permanent</option>
                              <option value="Contract">Contract</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Monthly Net Salary (PKR)
                            </label>
                            <input
                              type="number"
                              name="monthlyNetSalary"
                              value={formData.monthlyNetSalary}
                              onChange={handleChange}
                              placeholder="50000"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}

                      {(formData.incomeType === 'Business' || formData.incomeType === 'Self-Employed') && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Business Name
                            </label>
                            <input
                              type="text"
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nature of Business
                            </label>
                            <input
                              type="text"
                              name="natureOfBusiness"
                              value={formData.natureOfBusiness}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Years in Business
                            </label>
                            <input
                              type="number"
                              name="yearsInBusiness"
                              value={formData.yearsInBusiness}
                              onChange={handleChange}
                              min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Approx. Monthly Income (PKR)
                            </label>
                            <input
                              type="number"
                              name="approxMonthlyIncome"
                              value={formData.approxMonthlyIncome}
                              onChange={handleChange}
                              placeholder="100000"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="ntnAvailable"
                              checked={formData.ntnAvailable}
                              onChange={handleChange}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                              NTN Available
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Loan Requirement */}
                {currentStep === 3 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Loan Requirement</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Type *
                        </label>
                        <select
                          name="loanType"
                          value={formData.loanType}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-yellow-50"
                        >
                          <option value="">Select Type</option>
                          <option value="Home">Home</option>
                          <option value="Business">Business</option>
                          <option value="Auto">Auto</option>
                          <option value="Personal">Personal</option>
                        </select>
                        <p className="text-xs text-blue-600 mt-1">Auto-selected from plan</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Required Amount (PKR) *
                        </label>
                        <input
                          type="number"
                          name="requiredAmount"
                          value={formData.requiredAmount}
                          onChange={handleChange}
                          required
                          placeholder="1000000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-yellow-50"
                        />
                        <p className="text-xs text-blue-600 mt-1">Pre-filled from plan (editable)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Tenure (Months)
                        </label>
                        <input
                          type="number"
                          name="preferredTenure"
                          value={formData.preferredTenure}
                          onChange={handleChange}
                          placeholder="12"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-yellow-50"
                        />
                        <p className="text-xs text-blue-600 mt-1">Pre-filled from plan (editable)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Financing Preference
                        </label>
                        <select
                          name="financingPreference"
                          value={formData.financingPreference}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-yellow-50"
                        >
                          <option value="">Select Preference</option>
                          <option value="Conventional">Conventional</option>
                          <option value="Islamic">Islamic</option>
                          <option value="Either">Either</option>
                        </select>
                        <p className="text-xs text-blue-600 mt-1">Auto-selected from plan</p>
                      </div>
                    </div>

                    {(formData.financingPreference === 'Islamic' || plan.financingType === 'Islamic') && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Islamic Financing Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Preferred Mode
                            </label>
                            <select
                              name="preferredMode"
                              value={formData.preferredMode}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select Mode</option>
                              <option value="Murabaha">Murabaha</option>
                              <option value="Musharakah">Musharakah</option>
                              <option value="Diminishing Musharakah">Diminishing Musharakah</option>
                              <option value="Ijarah">Ijarah</option>
                              <option value="Salam">Salam</option>
                              <option value="Istisna">Istisna</option>
                              <option value="Not Sure">Not Sure</option>
                            </select>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="shariahTermsAccepted"
                              checked={formData.shariahTermsAccepted}
                              onChange={handleChange}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                              I accept Shariah terms
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Banking & Security */}
                {currentStep === 4 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Banking & Security</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Banking Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Names (comma-separated)
                          </label>
                          <input
                            type="text"
                            name="bankNames"
                            value={formData.bankNames}
                            onChange={handleChange}
                            placeholder="Bank Alfalah, Meezan Bank"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                          </label>
                          <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">Select Type</option>
                            <option value="Saving">Saving</option>
                            <option value="Current">Current</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Existing Loan (if any)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Loan Type
                          </label>
                          <input
                            type="text"
                            name="existingLoanType"
                            value={formData.existingLoanType}
                            onChange={handleChange}
                            placeholder="e.g., Personal Loan"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            name="existingLoanBank"
                            value={formData.existingLoanBank}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Monthly Installment (PKR)
                          </label>
                          <input
                            type="number"
                            name="existingLoanInstallment"
                            value={formData.existingLoanInstallment}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Security / Asset</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Security Offered
                          </label>
                          <select
                            name="securityOffered"
                            value={formData.securityOffered}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">Select Security</option>
                            <option value="Property">Property</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Guarantee">Guarantee</option>
                            <option value="None">None</option>
                          </select>
                        </div>

                        {formData.securityOffered && formData.securityOffered !== 'None' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Estimated Value (PKR)
                            </label>
                            <input
                              type="number"
                              name="estimatedValue"
                              value={formData.estimatedValue}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Declarations & Review */}
                {currentStep === 5 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Declarations & Consent</h2>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          name="creditCheckConsent"
                          checked={formData.creditCheckConsent}
                          onChange={handleChange}
                          required
                          className="h-4 w-4 mt-1 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 block text-sm text-gray-700">
                          I consent to credit bureau checks and verification of the information provided *
                        </label>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          name="informationConfirmed"
                          checked={formData.informationConfirmed}
                          onChange={handleChange}
                          required
                          className="h-4 w-4 mt-1 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 block text-sm text-gray-700">
                          I confirm that all information provided is true and accurate *
                        </label>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Notes (Optional)
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
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                      Cancel
                    </button>
                    
                    <div className="flex gap-3">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>
                      )}
                      
                      {currentStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium flex items-center gap-2"
                        >
                          Next
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
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
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Step {currentStep} of {totalSteps} {currentStep === totalSteps && '- Review and submit your application'}
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

export default ApplyLoan;
