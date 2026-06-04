import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAuthToken, getUser, isAuthenticated } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import SEO from '../../../components/SEO';
import { Toast, useToast } from '../../../components/Toast';

const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const ApplyInsurance = () => {
  // All hooks must be called unconditionally at the top level
  const { id } = useParams(); // insurance plan ID
  const router = useRouter();
  const cnicFileInputRef = useRef(null);
  const documentFileInputRef = useRef(null);
  const hasFetchedRef = useRef(false); // Track if we've already fetched to prevent duplicate calls
  const showErrorRef = useRef(null); // Store showError function in ref to avoid dependency issues
  
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [plan, setPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const totalSteps = 4;
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  
  // Store showError in ref so fetchPlanDetails doesn't need it as dependency
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);
  
  const [uploadingCNIC, setUploadingCNIC] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  
  // Get user data inside useState initializer to avoid calling it during render
  const [formData, setFormData] = useState(() => {
    const currentUser = getUser();
    return {
      // Applicant Information
      fullName: currentUser?.name || '',
      cnic: currentUser?.cnicNumber || '',
      mobileNumber: currentUser?.phoneNumber || '',
      email: currentUser?.email || '',
      residentialAddress: currentUser?.Address || '',
      city: '',
      preferredContactMethod: 'Call',
      
      // Policy-Specific Details (will be populated based on policyType)
      policySpecificDetails: {
        lifeInsurance: {},
        healthInsurance: {},
        motorInsurance: {},
        travelInsurance: {},
        propertyInsurance: {},
        takaful: {},
      },
      
      // Documents
      cnicCopy: '',
      planSpecificDocuments: [],
      
      // Authorization
      authorizationToMadadgaar: false,
      dataSharingConsent: false,
      termsAcceptance: false,
    };
  });

  const fetchPlanDetails = useCallback(async () => {
    if (!id) {
      setLoadingPlan(false);
      hasFetchedRef.current = false;
      return;
    }
    
    try {
      setLoadingPlan(true);
      console.log('Fetching plan details for ID:', id);
      console.log('API URL:', `${backendBaseUrl}/getInsurancePlan/${id}`);
      
      const response = await fetch(`${backendBaseUrl}/getInsurancePlan/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: Failed to load insurance plan` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to load insurance plan`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to load insurance plan');
      }

      if (!data.data) {
        throw new Error('Plan data is missing in response');
      }

      console.log('Plan details loaded successfully');
      setPlan(data.data);
      hasFetchedRef.current = true; // Mark as successfully fetched
    } catch (err) {
      console.error('Error fetching plan details:', err);
      if (showErrorRef.current) {
        showErrorRef.current(err.message || 'Failed to load insurance plan. Please try again.');
      }
      setPlan(null); // Set plan to null on error
      hasFetchedRef.current = false; // Reset on error so user can retry
    } finally {
      setLoadingPlan(false);
    }
  }, [id]); // Only depend on id, use ref for showError

  // Reset fetch flag only when id changes
  useEffect(() => {
    hasFetchedRef.current = false;
    setPlan(null);
    setLoadingPlan(true);
  }, [id]);

  // Main effect to fetch plan details
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/account');
      return;
    }
    
    if (!id) {
      setLoadingPlan(false);
      setPlan(null);
      return;
    }
    
    // Prevent duplicate fetches or fetching after submission
    if (hasFetchedRef.current || submitted) {
      if (submitted) {
        setLoadingPlan(false);
      }
      return;
    }
    
    // Mark as fetching to prevent duplicate calls
    hasFetchedRef.current = true;
    
    // Fetch plan details
    fetchPlanDetails();
    
    // Timeout to prevent infinite loading (15 seconds)
    const timeout = setTimeout(() => {
      setLoadingPlan((prev) => {
        if (prev) {
          console.error('Request timed out after 15 seconds');
          if (showErrorRef.current) {
            showErrorRef.current('Request timed out. Please refresh the page and try again.');
          }
          hasFetchedRef.current = false; // Reset on timeout
          return false;
        }
        return prev;
      });
    }, 15000);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [id, fetchPlanDetails, router, submitted]); // Removed showError from dependencies

  const updateFormField = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePolicyDetailChange = (policyType, field, value) => {
    setFormData(prev => ({
      ...prev,
      policySpecificDetails: {
        ...prev.policySpecificDetails,
        [policyType]: {
          ...prev.policySpecificDetails[policyType],
          [field]: value
        }
      }
    }));
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      showError('Please select an image or PDF file');
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size should be less than 5MB');
      return null;
    }

    try {
      if (type === 'cnic') {
        setUploadingCNIC(true);
      } else {
        setUploadingDocuments(true);
      }

      const token = getAuthToken();
      const formDataObj = new FormData();
      formDataObj.append('image', file);

      const response = await fetch(`${backendBaseUrl}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload file');
      }

      const uploadedUrl = data.url || data.imageUrl || data.data?.url;

      if (type === 'cnic') {
        setFormData(prev => ({ ...prev, cnicCopy: uploadedUrl }));
        showSuccess('CNIC copy uploaded successfully');
      } else {
        setFormData(prev => ({
          ...prev,
          planSpecificDocuments: [...prev.planSpecificDocuments, uploadedUrl]
        }));
        showSuccess('Document uploaded successfully');
      }

      return uploadedUrl;
    } catch (err) {
      console.error('File upload error:', err);
      showError(err.message || 'Failed to upload file');
      return null;
    } finally {
      if (type === 'cnic') {
        setUploadingCNIC(false);
      } else {
        setUploadingDocuments(false);
      }
    }
  };

  const handleCNICUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'cnic');
    }
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'document');
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      planSpecificDocuments: prev.planSpecificDocuments.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim() || !formData.cnic.trim() || 
            !formData.residentialAddress.trim() || !formData.city.trim()) {
          showError('Please fill in all required fields');
          return false;
        }
        return true;
      case 2:
        // Policy-specific validation can be added here
        return true;
      case 3:
        if (!formData.cnicCopy) {
          showError('Please upload your CNIC copy');
          return false;
        }
        return true;
      case 4:
        if (!formData.authorizationToMadadgaar || !formData.dataSharingConsent || 
            !formData.termsAcceptance) {
          showError('Please accept all authorization terms');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading || submitted) {
      return;
    }
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      if (!plan || !id) {
        throw new Error('Insurance plan information is missing');
      }

      // Build policy-specific details based on policy type
      const policySpecificDetails = {};
      if (plan.policyType === 'Life' && Object.keys(formData.policySpecificDetails.lifeInsurance || {}).length > 0) {
        policySpecificDetails.lifeInsurance = formData.policySpecificDetails.lifeInsurance;
      } else if (plan.policyType === 'Health' && Object.keys(formData.policySpecificDetails.healthInsurance || {}).length > 0) {
        policySpecificDetails.healthInsurance = formData.policySpecificDetails.healthInsurance;
      } else if (plan.policyType === 'Motor' && Object.keys(formData.policySpecificDetails.motorInsurance || {}).length > 0) {
        policySpecificDetails.motorInsurance = formData.policySpecificDetails.motorInsurance;
      } else if (plan.policyType === 'Travel' && Object.keys(formData.policySpecificDetails.travelInsurance || {}).length > 0) {
        policySpecificDetails.travelInsurance = formData.policySpecificDetails.travelInsurance;
      } else if (plan.policyType === 'Property' && Object.keys(formData.policySpecificDetails.propertyInsurance || {}).length > 0) {
        policySpecificDetails.propertyInsurance = formData.policySpecificDetails.propertyInsurance;
      } else if (plan.policyType === 'Takaful' && Object.keys(formData.policySpecificDetails.takaful || {}).length > 0) {
        policySpecificDetails.takaful = formData.policySpecificDetails.takaful;
      }

      const applicationData = {
        planId: id,
        applicantInfo: {
          fullName: formData.fullName.trim(),
          cnic: formData.cnic.trim(),
          mobileNumber: formData.mobileNumber || undefined,
          email: formData.email || undefined,
          residentialAddress: formData.residentialAddress.trim(),
          city: formData.city.trim(),
          preferredContactMethod: formData.preferredContactMethod,
        },
        policySpecificDetails: Object.keys(policySpecificDetails).length > 0 ? policySpecificDetails : undefined,
        documents: {
          cnicCopy: formData.cnicCopy,
          planSpecificDocuments: formData.planSpecificDocuments.length > 0 
            ? formData.planSpecificDocuments 
            : undefined,
        },
        authorization: {
          authorizationToMadadgaar: formData.authorizationToMadadgaar,
          dataSharingConsent: formData.dataSharingConsent,
          termsAcceptance: formData.termsAcceptance,
        },
      };

      const response = await fetch(`${backendBaseUrl}/applyForInsurance`, {
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

      // Mark as submitted to prevent resubmission
      setSubmitted(true);
      showSuccess('Insurance application submitted successfully! Our agent will contact you soon.');
      
      // Navigate to insurance page after successful submission using React Router
      setTimeout(() => {
        router.push('/insurance');
      }, 2000);

    } catch (err) {
      console.error('Application submit error:', err);
      showError(err.message || 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  if (loadingPlan) {
    return (
      <>
        <Toast toasts={toasts} onClose={removeToast} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full size-16 border-b-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading insurance plan details...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait...</p>
          </div>
        </div>
      </>
    );
  }

  if (!plan && !loadingPlan) {
    return (
      <>
        <Toast toasts={toasts} onClose={removeToast} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Insurance Plan Not Found</h2>
            <p className="text-gray-600 mb-6">The insurance plan you're looking for doesn't exist or could not be loaded.</p>
            <div className="flex gap-3 justify-center">
              <button type="button"
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Go Back
              </button>
              <button type="button"
                onClick={() => router.push('/insurance')}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Browse Insurance Plans
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const steps = [
    { number: 1, title: 'Applicant Info', desc: 'Personal & contact details' },
    { number: 2, title: 'Policy Details', desc: 'Additional information' },
    { number: 3, title: 'Documents', desc: 'Upload required documents' },
    { number: 4, title: 'Review & Submit', desc: 'Final confirmation' },
  ];

  return (
    <>
      <Toast toasts={toasts} onClose={removeToast} />
      <SEO
        title={`Apply for ${plan.planName} | Madadgaar`}
        description={`Apply for ${plan.planName} insurance plan from ${plan.registeredCompanyName}. Easy application process.`}
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-content">
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
              Apply for Insurance
            </h1>
            <p className="text-gray-600 mt-2 text-responsive-sm">Complete the application in simple steps</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Summary</h2>
                
                {plan.planImage && (
                  <div className="aspect-video w-full mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={plan.planImage}
                      alt={plan.planName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-2">{plan.planName}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.registeredCompanyName}</p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Policy Type:</span>
                    <span className="font-semibold text-gray-900">{plan.policyType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${
                      plan.planStatus === 'Active' ? 'text-green-600' : 
                      plan.planStatus === 'Limited' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {plan.planStatus || 'Active'}
                    </span>
                  </div>
                  {(() => {
                    const policyDetails = plan.policyType === 'Life' ? plan.lifeInsurancePlan :
                                        plan.policyType === 'Health' ? plan.healthInsurancePlan :
                                        plan.policyType === 'Motor' ? plan.motorInsurancePlan :
                                        plan.policyType === 'Travel' ? plan.travelInsurancePlan :
                                        plan.policyType === 'Property' ? plan.propertyInsurancePlan :
                                        plan.policyType === 'Takaful' ? plan.takafulPlan : null;
                    
                    const sumAssured = policyDetails?.sumAssured || policyDetails?.annualCoverageLimit || policyDetails?.sumCovered;
                    const premium = policyDetails?.premiumAmount || policyDetails?.annualPremium || policyDetails?.contributionAmount;
                    
                    return (
                      <>
                        {sumAssured && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Coverage:</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(sumAssured)}
                            </span>
                          </div>
                        )}
                        {premium && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Premium:</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(premium)}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
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
                        <div className={`size-6 rounded-full flex items-center justify-center text-xs ${
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

            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            {/* Step 1: Applicant Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Applicant Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={updateFormField}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">
                      CNIC Number <span className="text-red-500">*</span>
                    </label>
                    <input id="cnic"
                      type="text"
                      name="cnic"
                      value={formData.cnic}
                      onChange={updateFormField}
                      placeholder="XXXXX-XXXXXXX-X"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input id="mobileNumber"
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={updateFormField}
                      placeholder="03XX-XXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={updateFormField}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="residentialAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <textarea id="residentialAddress"
                      name="residentialAddress"
                      value={formData.residentialAddress}
                      onChange={updateFormField}
                      rows={3}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input id="city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={updateFormField}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Contact Method
                    </label>
                    <select id="preferredContactMethod"
                      name="preferredContactMethod"
                      value={formData.preferredContactMethod}
                      onChange={updateFormField}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="Call">Call</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Policy-Specific Details (Optional) */}
            {currentStep === 2 && plan && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
                <p className="text-gray-600 text-sm mb-6">
                  This step is optional. You can provide additional details specific to your policy type.
                </p>

                {/* Life Insurance Fields */}
                {plan.policyType === 'Life' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Life Insurance Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Nominee Name
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.lifeInsurance?.nomineeName || ''}
                          onChange={(e) => handlePolicyDetailChange('lifeInsurance', 'nomineeName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship with Nominee
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.lifeInsurance?.relationshipWithNominee || ''}
                          onChange={(e) => handlePolicyDetailChange('lifeInsurance', 'relationshipWithNominee', e.target.value)}
                          placeholder="e.g., Spouse, Child, Parent"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Sum Assured (PKR)
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="number"
                          value={formData.policySpecificDetails.lifeInsurance?.sumAssured || ''}
                          onChange={(e) => handlePolicyDetailChange('lifeInsurance', 'sumAssured', parseFloat(e.target.value) || '')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Beneficiary CNIC
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.lifeInsurance?.beneficiaryCNIC || ''}
                          onChange={(e) => handlePolicyDetailChange('lifeInsurance', 'beneficiaryCNIC', e.target.value)}
                          placeholder="XXXXX-XXXXXXX-X"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Insurance Fields */}
                {plan.policyType === 'Health' && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Health Insurance Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Insured Person Name
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.healthInsurance?.insuredPersonName || ''}
                          onChange={(e) => handlePolicyDetailChange('healthInsurance', 'insuredPersonName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.healthInsurance?.relationship || ''}
                          onChange={(e) => handlePolicyDetailChange('healthInsurance', 'relationship', e.target.value)}
                          placeholder="e.g., Self, Spouse, Child"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="number"
                          value={formData.policySpecificDetails.healthInsurance?.age || ''}
                          onChange={(e) => handlePolicyDetailChange('healthInsurance', 'age', parseInt(e.target.value) || '')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Pre-existing Conditions
                        </label>
                        <textarea id="authorizationToMadadgaar"
                          value={formData.policySpecificDetails.healthInsurance?.preExistingConditions || ''}
                          onChange={(e) => handlePolicyDetailChange('healthInsurance', 'preExistingConditions', e.target.value)}
                          rows={3}
                          placeholder="Please mention any pre-existing medical conditions"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Motor Insurance Fields */}
                {plan.policyType === 'Motor' && (
                  <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Motor Insurance Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle Type
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.motorInsurance?.vehicleType || ''}
                          onChange={(e) => handlePolicyDetailChange('motorInsurance', 'vehicleType', e.target.value)}
                          placeholder="e.g., Car, Motorcycle, Truck"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle Model
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.motorInsurance?.vehicleModel || ''}
                          onChange={(e) => handlePolicyDetailChange('motorInsurance', 'vehicleModel', e.target.value)}
                          placeholder="e.g., Toyota Corolla 2020"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Registration Number
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.motorInsurance?.vehicleRegistrationNumber || ''}
                          onChange={(e) => handlePolicyDetailChange('motorInsurance', 'vehicleRegistrationNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Year of Manufacture
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="number"
                          value={formData.policySpecificDetails.motorInsurance?.yearOfManufacture || ''}
                          onChange={(e) => handlePolicyDetailChange('motorInsurance', 'yearOfManufacture', parseInt(e.target.value) || '')}
                          min="1900"
                          max={new Date().getFullYear()}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Driving License Number
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.motorInsurance?.drivingLicenseNumber || ''}
                          onChange={(e) => handlePolicyDetailChange('motorInsurance', 'drivingLicenseNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Travel Insurance Fields */}
                {plan.policyType === 'Travel' && (
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Travel Insurance Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Travel Start Date
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="date"
                          value={formData.policySpecificDetails.travelInsurance?.travelStartDate || ''}
                          onChange={(e) => handlePolicyDetailChange('travelInsurance', 'travelStartDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Travel End Date
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="date"
                          value={formData.policySpecificDetails.travelInsurance?.travelEndDate || ''}
                          onChange={(e) => handlePolicyDetailChange('travelInsurance', 'travelEndDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Destination Country
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.travelInsurance?.destinationCountry || ''}
                          onChange={(e) => handlePolicyDetailChange('travelInsurance', 'destinationCountry', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Destination City
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.travelInsurance?.destinationCity || ''}
                          onChange={(e) => handlePolicyDetailChange('travelInsurance', 'destinationCity', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Traveler Age
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="number"
                          value={formData.policySpecificDetails.travelInsurance?.travelerAge || ''}
                          onChange={(e) => handlePolicyDetailChange('travelInsurance', 'travelerAge', parseInt(e.target.value) || '')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Insurance Fields */}
                {plan.policyType === 'Property' && (
                  <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Property Insurance Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Property Type
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.propertyInsurance?.propertyType || ''}
                          onChange={(e) => handlePolicyDetailChange('propertyInsurance', 'propertyType', e.target.value)}
                          placeholder="e.g., House, Apartment, Commercial"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Property Value (PKR)
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="number"
                          value={formData.policySpecificDetails.propertyInsurance?.estimatedPropertyValue || ''}
                          onChange={(e) => handlePolicyDetailChange('propertyInsurance', 'estimatedPropertyValue', parseFloat(e.target.value) || '')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Property Address
                        </label>
                        <textarea id="authorizationToMadadgaar"
                          value={formData.policySpecificDetails.propertyInsurance?.propertyAddress || ''}
                          onChange={(e) => handlePolicyDetailChange('propertyInsurance', 'propertyAddress', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Takaful Fields */}
                {plan.policyType === 'Takaful' && (
                  <div className="space-y-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Takaful Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Participant Name
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.takaful?.participantName || ''}
                          onChange={(e) => handlePolicyDetailChange('takaful', 'participantName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Contribution Amount (PKR)
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="number"
                          value={formData.policySpecificDetails.takaful?.contributionAmount || ''}
                          onChange={(e) => handlePolicyDetailChange('takaful', 'contributionAmount', parseFloat(e.target.value) || '')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-1">
                          Beneficiary Nominee
                        </label>
                        <input id="authorizationToMadadgaar"
                          type="text"
                          value={formData.policySpecificDetails.takaful?.beneficiaryNominee || ''}
                          onChange={(e) => handlePolicyDetailChange('takaful', 'beneficiaryNominee', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.policySpecificDetails.takaful?.shariahComplianceAgreement || false}
                            onChange={(e) => handlePolicyDetailChange('takaful', 'shariahComplianceAgreement', e.target.checked)}
                            className="mt-1 size-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <label htmlFor="authorizationToMadadgaar" className="text-sm text-gray-700">
                            I agree to Shariah compliance terms and conditions
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Documents</h2>
                
                <div>
                  <label htmlFor="authorizationToMadadgaar" className="block text-sm font-medium text-gray-700 mb-2">
                    CNIC Copy <span className="text-red-500">*</span>
                  </label>
                  <input id="authorizationToMadadgaar"
                    ref={cnicFileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleCNICUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cnicFileInputRef.current?.click()}
                    disabled={uploadingCNIC}
                    className="w-full px-4 py-3 border-2 border-dashed border-red-300 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                  >
                    {uploadingCNIC ? (
                      <>
                        <div className="animate-spin rounded-full size-5 border-b-2 border-red-600"></div>
                        <span>Uploading...</span>
                      </>
                    ) : formData.cnicCopy ? (
                      <>
                        <svg className="size-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>CNIC Copy Uploaded</span>
                      </>
                    ) : (
                      <>
                        <svg className="size-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload CNIC Copy</span>
                      </>
                    )}
                  </button>
                  {formData.cnicCopy && (
                    <p className="mt-2 text-sm text-green-600">✓ CNIC copy uploaded successfully</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Documents (Optional)
                  </label>
                  <input id="authorizationToMadadgaar"
                    ref={documentFileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => documentFileInputRef.current?.click()}
                    disabled={uploadingDocuments}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    {uploadingDocuments ? (
                      <>
                        <div className="animate-spin rounded-full size-5 border-b-2 border-gray-600"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Additional Documents</span>
                      </>
                    )}
                  </button>
                  
                  {formData.planSpecificDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.planSpecificDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 truncate flex-1">{doc.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="ml-2 text-red-600 hover:text-red-700"
                          >
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Authorization & Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Authorization & Review</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="authorizationToMadadgaar"
                      checked={formData.authorizationToMadadgaar}
                      onChange={updateFormField}
                      className="mt-1 size-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="text-sm text-gray-700">
                      I authorize Madadgaar to process my insurance application <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="dataSharingConsent"
                      checked={formData.dataSharingConsent}
                      onChange={updateFormField}
                      className="mt-1 size-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="text-sm text-gray-700">
                      I consent to data sharing with insurance company <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="termsAcceptance"
                      checked={formData.termsAcceptance}
                      onChange={updateFormField}
                      className="mt-1 size-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label className="text-sm text-gray-700">
                      I accept the terms and conditions <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>

                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Application Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Plan:</strong> {plan.planName}</div>
                    <div><strong>Company:</strong> {plan.registeredCompanyName}</div>
                    <div><strong>Policy Type:</strong> {plan.policyType}</div>
                    <div><strong>Applicant:</strong> {formData.fullName}</div>
                    <div><strong>CNIC:</strong> {formData.cnic}</div>
                    <div><strong>City:</strong> {formData.city}</div>
                    <div><strong>CNIC Copy:</strong> {formData.cnicCopy ? '✓ Uploaded' : '✗ Not uploaded'}</div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || submitted}
                    className="px-8 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyInsurance;
