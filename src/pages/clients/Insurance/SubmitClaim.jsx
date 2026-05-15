import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getUser, isAuthenticated } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import SEO from '../../../components/SEO';
import { Toast, useToast } from '../../../components/Toast';

const SubmitClaim = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState({ type: '', status: false });
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  
  const [serviceType, setServiceType] = useState('claim'); // 'claim' or 'maturity'
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Applicant Information
    fullName: currentUser?.name || '',
    cnic: currentUser?.cnicNumber || '',
    mobileNumber: currentUser?.phoneNumber || '',
    email: currentUser?.email || '',
    residentialAddress: currentUser?.Address || '',
    city: '',
    preferredContactMethod: 'Call',
    
    // Policy Information
    insuranceCompanyName: '',
    insuranceCompanyBranch: '',
    policyType: 'Life',
    policyNumber: '',
    policyStartDate: '',
    policyExpiryDate: '',
    policyMaturityDate: '',
    
    // Claim Details
    claimType: 'Cashless',
    claimCategory: 'Accident',
    dateOfIncident: '',
    placeOfIncident: '',
    briefDescription: '',
    firPoliceReportAvailable: '',
    estimatedClaimAmount: '',
    hospitalWorkshopVendorName: '',
    panelProvider: '',
    serviceDate: '',
    serviceDateEnd: '',
    paymentStatus: 'Unpaid',
    
    // Maturity Details
    maturityType: 'Life',
    maturityDate: '',
    expectedMaturityAmount: '',
    bonusProfitExpected: '',
    nomineeBeneficiaryName: '',
    relationshipWithPolicyholder: '',
    paymentMode: '',
    
    // Documents
    cnicCopy: '',
    policyCopy: '',
    claimForm: '',
    billsReceipts: [],
    medicalReports: [],
    firPoliceReport: '',
    vehicleRegistration: '',
    deathCertificate: '',
    maturityClaimForm: '',
    bankAccountProof: '',
    nomineeCNIC: '',
    otherSupportingDocuments: [],
    
    // Bank Details
    accountHolderName: '',
    bankName: '',
    iban: '',
    accountNumber: '',
    branchName: '',
    
    // Authorization
    authorizationToMadadgaar: false,
    dataSharingConsent: false,
    termsAcceptance: false,
  });

  // Define steps based on service type (must be after formData is defined)
  const getSteps = () => {
    if (serviceType === 'claim') {
      return [
        { number: 1, title: 'Service Type', desc: 'Select claim or maturity' },
        { number: 2, title: 'Applicant Info', desc: 'Personal & contact details' },
        { number: 3, title: 'Policy Details', desc: 'Insurance policy information' },
        { number: 4, title: 'Claim Details', desc: 'Incident information' },
        { number: 5, title: 'Amount & Provider', desc: 'Claim amount & provider' },
        { number: 6, title: 'Documents', desc: 'Upload required documents' },
        { number: 7, title: 'Bank Details', desc: formData.claimType === 'Reimbursement' ? 'Bank account information' : 'Optional' },
        { number: 8, title: 'Review & Submit', desc: 'Final confirmation' },
      ];
    } else {
      return [
        { number: 1, title: 'Service Type', desc: 'Select claim or maturity' },
        { number: 2, title: 'Applicant Info', desc: 'Personal & contact details' },
        { number: 3, title: 'Policy Details', desc: 'Insurance policy information' },
        { number: 4, title: 'Maturity Details', desc: 'Maturity information' },
        { number: 5, title: 'Payment & Bank Details', desc: 'Payment mode & bank information' },
        { number: 6, title: 'Documents', desc: 'Upload required documents' },
        { number: 7, title: 'Review & Submit', desc: 'Final confirmation' },
      ];
    }
  };
  
  const steps = getSteps();
  const totalSteps = steps.length;

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/account');
    }
  }, [navigate]);

  // Reset to step 1 when service type changes
  React.useEffect(() => {
    setCurrentStep(1);
  }, [serviceType]);

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return true; // Service type selection
      case 2:
        if (!formData.fullName.trim() || !formData.cnic.trim() || !formData.mobileNumber.trim() || 
            !formData.residentialAddress.trim() || !formData.city.trim()) {
          showError('Please fill in all required applicant information');
          return false;
        }
        return true;
      case 3:
        if (!formData.insuranceCompanyName.trim() || !formData.policyNumber.trim() || 
            !formData.policyStartDate) {
          showError('Please fill in all required policy information');
          return false;
        }
        return true;
      case 4:
        if (serviceType === 'claim') {
          if (!formData.claimType || !formData.claimCategory || !formData.dateOfIncident || 
              !formData.placeOfIncident || !formData.briefDescription) {
            showError('Please fill in all required claim details');
            return false;
          }
        } else {
          if (!formData.maturityType || !formData.nomineeBeneficiaryName || 
              !formData.relationshipWithPolicyholder) {
            showError('Please fill in all required maturity details');
            return false;
          }
        }
        return true;
      case 5:
        if (serviceType === 'claim') {
          if (!formData.estimatedClaimAmount || !formData.hospitalWorkshopVendorName || 
              !formData.panelProvider || !formData.paymentStatus) {
            showError('Please fill in all required claim amount & provider information');
            return false;
          }
        } else {
          if (!formData.paymentMode) {
            showError('Please select payment mode');
            return false;
          }
        }
        return true;
      case 6:
        if (!formData.cnicCopy || !formData.policyCopy) {
          showError('CNIC copy and policy copy are required');
          return false;
        }
        return true;
      case 7:
        if (serviceType === 'maturity' || 
            (serviceType === 'claim' && formData.claimType === 'Reimbursement')) {
          if (!formData.accountHolderName.trim() || !formData.bankName.trim() || 
              !formData.accountNumber.trim()) {
            showError('Bank details are required');
            return false;
          }
        }
        return true;
      case 8:
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return null;

    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      showError('Please select an image or PDF file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('File size should be less than 5MB');
      return null;
    }

    try {
      setUploadingFile({ type: fieldName, status: true });

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

      if (fieldName === 'cnicCopy' || fieldName === 'policyCopy' || fieldName === 'claimForm' || 
          fieldName === 'firPoliceReport' || fieldName === 'vehicleRegistration' || 
          fieldName === 'deathCertificate' || fieldName === 'maturityClaimForm' || 
          fieldName === 'bankAccountProof' || fieldName === 'nomineeCNIC') {
        setFormData(prev => ({ ...prev, [fieldName]: uploadedUrl }));
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: [...(prev[fieldName] || []), uploadedUrl]
        }));
      }

      showSuccess('File uploaded successfully');
      return uploadedUrl;
    } catch (err) {
      console.error('File upload error:', err);
      showError(err.message || 'Failed to upload file');
      return null;
    } finally {
      setUploadingFile({ type: '', status: false });
    }
  };

  const removeDocument = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim() || !formData.cnic.trim() || !formData.mobileNumber.trim() || 
        !formData.residentialAddress.trim() || !formData.city.trim()) {
      showError('Please fill in all required applicant information');
      return false;
    }

    if (!formData.insuranceCompanyName.trim() || !formData.policyNumber.trim() || 
        !formData.policyStartDate) {
      showError('Please fill in all required policy information');
      return false;
    }

    if (serviceType === 'claim') {
      if (!formData.claimType || !formData.claimCategory) {
        showError('Please fill in claim details');
        return false;
      }
    } else {
      if (!formData.maturityType) {
        showError('Please fill in maturity details');
        return false;
      }
    }

    if (!formData.cnicCopy || !formData.policyCopy) {
      showError('CNIC copy and policy copy are required');
      return false;
    }

    if (serviceType === 'maturity' || 
        (serviceType === 'claim' && formData.claimType === 'Reimbursement')) {
      if (!formData.accountHolderName.trim() || !formData.bankName.trim() || 
          !formData.accountNumber.trim()) {
        showError('Bank details are required');
        return false;
      }
    }

    if (!formData.authorizationToMadadgaar || !formData.dataSharingConsent || 
        !formData.termsAcceptance) {
      showError('Please accept all authorization terms');
      return false;
    }

    return true;
  };

  /** Web form uses Yes/No strings; backend expects booleans */
  const yesNoToBoolean = (value) => {
    if (value === true || value === false) return value;
    if (value === 'Yes') return true;
    if (value === 'No') return false;
    return undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const payload = {
        serviceType,
        applicantInfo: {
          fullName: formData.fullName.trim(),
          cnic: formData.cnic.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          email: formData.email || undefined,
          residentialAddress: formData.residentialAddress.trim(),
          city: formData.city.trim(),
          preferredContactMethod: formData.preferredContactMethod,
        },
        insuranceCompanyName: formData.insuranceCompanyName.trim(),
        insuranceCompanyBranch: formData.insuranceCompanyBranch || undefined,
        policyType: formData.policyType,
        policyNumber: formData.policyNumber.trim(),
        policyStartDate: formData.policyStartDate,
        policyExpiryDate: formData.policyExpiryDate || undefined,
        policyMaturityDate: formData.policyMaturityDate || undefined,
        claimDetails: serviceType === 'claim' ? {
          claimType: formData.claimType,
          claimCategory: formData.claimCategory,
          dateOfIncident: formData.dateOfIncident || undefined,
          placeOfIncident: formData.placeOfIncident || undefined,
          briefDescription: formData.briefDescription || undefined,
          firPoliceReportAvailable: yesNoToBoolean(formData.firPoliceReportAvailable),
          estimatedClaimAmount: formData.estimatedClaimAmount ? Number(formData.estimatedClaimAmount) : undefined,
          hospitalWorkshopVendorName: formData.hospitalWorkshopVendorName || undefined,
          panelProvider: yesNoToBoolean(formData.panelProvider),
          serviceDates:
            formData.serviceDate || formData.serviceDateEnd
              ? {
                  start: formData.serviceDate || undefined,
                  end: formData.serviceDateEnd || undefined,
                }
              : undefined,
          paymentStatus: formData.paymentStatus || undefined,
        } : undefined,
        maturityDetails: serviceType === 'maturity' ? {
          maturityType: formData.maturityType,
          maturityDate: formData.maturityDate || undefined,
          expectedMaturityAmount: formData.expectedMaturityAmount ? Number(formData.expectedMaturityAmount) : undefined,
          bonusProfitExpected: yesNoToBoolean(formData.bonusProfitExpected),
          nomineeBeneficiaryName: formData.nomineeBeneficiaryName || undefined,
          relationshipWithPolicyholder: formData.relationshipWithPolicyholder || undefined,
          paymentMode: formData.paymentMode || undefined,
        } : undefined,
        documents: {
          cnicCopy: formData.cnicCopy,
          policyCopy: formData.policyCopy,
          claimForm: formData.claimForm || undefined,
          billsReceipts: formData.billsReceipts.length > 0 ? formData.billsReceipts : undefined,
          medicalReports: formData.medicalReports.length > 0 ? formData.medicalReports : undefined,
          firPoliceReport: formData.firPoliceReport || undefined,
          vehicleRegistration: formData.vehicleRegistration || undefined,
          deathCertificate: formData.deathCertificate || undefined,
          maturityClaimForm: formData.maturityClaimForm || undefined,
          bankAccountProof: formData.bankAccountProof || undefined,
          nomineeCNIC: formData.nomineeCNIC || undefined,
          otherSupportingDocuments: formData.otherSupportingDocuments.length > 0 ? formData.otherSupportingDocuments : undefined,
        },
        bankDetails: (serviceType === 'maturity' || 
                      (serviceType === 'claim' && formData.claimType === 'Reimbursement')) ? {
          accountHolderName: formData.accountHolderName.trim(),
          bankName: formData.bankName.trim(),
          iban: formData.iban || undefined,
          accountNumber: formData.accountNumber.trim(),
          branchName: formData.branchName || undefined,
        } : undefined,
        authorization: {
          authorizationToMadadgaar: formData.authorizationToMadadgaar,
          dataSharingConsent: formData.dataSharingConsent,
          termsAcceptance: formData.termsAcceptance,
        },
      };

      const response = await fetch(`${backendBaseUrl}/submitInsuranceClaim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit request');
      }

      setSubmitted(true);
      showSuccess(`${serviceType === 'claim' ? 'Claim' : 'Maturity'} request submitted successfully! Case Reference: ${data.data?.caseReferenceNumber || 'N/A'}`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Claim submission error:', err);
      showError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadButton = ({ fieldName, label, required = false, accept = "image/*,application/pdf" }) => {
    const fileInputRef = useRef(null);
    const isUploading = uploadingFile.type === fieldName && uploadingFile.status;
    const hasFile = Array.isArray(formData[fieldName]) 
      ? formData[fieldName].length > 0 
      : formData[fieldName];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleFileUpload(file, fieldName);
            }
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full px-4 py-3 border-2 border-dashed rounded-lg transition flex items-center justify-center gap-2 ${
            hasFile 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              <span>Uploading...</span>
            </>
          ) : hasFile ? (
            <>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{label} Uploaded</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload {label}</span>
            </>
          )}
        </button>
        {Array.isArray(formData[fieldName]) && formData[fieldName].length > 0 && (
          <div className="mt-2 space-y-2">
            {formData[fieldName].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-700 truncate flex-1">{doc.split('/').pop()}</span>
                <button
                  type="button"
                  onClick={() => removeDocument(fieldName, index)}
                  className="ml-2 text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Toast toasts={toasts} onClose={removeToast} />
      <SEO
        title={`Submit ${serviceType === 'claim' ? 'Insurance Claim' : 'Maturity Request'} | Madadgaar`}
        description={`Submit your ${serviceType === 'claim' ? 'insurance claim' : 'maturity request'} through Madadgaar. Fast and transparent processing.`}
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-content">
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
              Submit {serviceType === 'claim' ? 'Insurance Claim' : 'Maturity Request'}
            </h1>
            <p className="text-gray-600 mt-2 text-responsive-sm">Complete the form in simple steps</p>
          </div>

          {/* Service Type Toggle */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Service Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setServiceType('claim');
                  setCurrentStep(1);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                  serviceType === 'claim'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Claim
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceType('maturity');
                  setCurrentStep(1);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                  serviceType === 'maturity'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Maturity
              </button>
            </div>
          </div>

          {/* Progress Bar - Top */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Progress Bar */}
            <div className="relative mb-8">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-red-600 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Step Points */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const isActive = step.number === currentStep;
                  const isCompleted = step.number < currentStep;
                  
                  return (
                    <div key={step.number} className="flex flex-col items-center" style={{ flex: 1 }}>
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        isActive 
                          ? 'bg-red-600 text-white shadow-lg scale-110 border-2 border-red-700' 
                          : isCompleted 
                          ? 'bg-green-500 text-white border-2 border-green-600' 
                          : 'bg-gray-200 text-gray-500 border-2 border-gray-300'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </div>
                      <div className="mt-3 text-center max-w-[100px]">
                        <div className={`text-xs font-semibold ${
                          isActive ? 'text-red-600' : 
                          isCompleted ? 'text-green-600' : 
                          'text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                        {isActive && (
                          <div className="text-xs text-gray-500 mt-1">{step.desc}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Current Step Info */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-semibold">
                  {currentStep}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Step {currentStep} of {totalSteps}
                  </div>
                  <div className="text-sm text-gray-600">
                    {steps[currentStep - 1]?.title}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                {/* Step 1: Service Type Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select Service Type</h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Please select whether you want to submit an insurance claim or a maturity request.
                    </p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setServiceType('claim');
                          setTimeout(() => nextStep(), 100);
                        }}
                        className={`flex-1 p-6 rounded-lg border-2 transition ${
                          serviceType === 'claim'
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-2">🏥</div>
                        <div className="font-semibold text-lg mb-1">Insurance Claim</div>
                        <div className="text-sm text-gray-600">Submit a claim for an incident or loss</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setServiceType('maturity');
                          setTimeout(() => nextStep(), 100);
                        }}
                        className={`flex-1 p-6 rounded-lg border-2 transition ${
                          serviceType === 'maturity'
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-2">💰</div>
                        <div className="font-semibold text-lg mb-1">Maturity Request</div>
                        <div className="text-sm text-gray-600">Request maturity payment for your policy</div>
                      </button>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        Cancel
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

                {/* Step 2: Applicant Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Applicant Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CNIC Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cnic"
                          value={formData.cnic}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Residential Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="residentialAddress"
                          value={formData.residentialAddress}
                          onChange={handleChange}
                          rows={3}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Contact Method
                        </label>
                        <select
                          name="preferredContactMethod"
                          value={formData.preferredContactMethod}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="Call">Call</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email">Email</option>
                        </select>
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
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Policy Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Policy Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="insuranceCompanyName"
                    value={formData.insuranceCompanyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Company Branch
                  </label>
                  <input
                    type="text"
                    name="insuranceCompanyBranch"
                    value={formData.insuranceCompanyBranch}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type <span className="text-red-500">*</span></label>
                  <select
                    name="policyType"
                    value={formData.policyType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="Life">Life</option>
                    <option value="Health">Health</option>
                    <option value="Motor">Motor</option>
                    <option value="Travel">Travel</option>
                    <option value="Property">Property</option>
                    <option value="Takaful">Takaful</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="policyStartDate"
                    value={formData.policyStartDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Expiry Date</label>
                  <input
                    type="date"
                    name="policyExpiryDate"
                    value={formData.policyExpiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                {serviceType === 'maturity' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy Maturity Date</label>
                    <input
                      type="date"
                      name="policyMaturityDate"
                      value={formData.policyMaturityDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
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

                {/* Step 4: Claim Details (for Claim) */}
                {currentStep === 4 && serviceType === 'claim' && (
                  <>
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type <span className="text-red-500">*</span></label>
                      <select
                        name="claimType"
                        value={formData.claimType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="Cashless">Cashless</option>
                        <option value="Reimbursement">Reimbursement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Claim Category <span className="text-red-500">*</span></label>
                      <select
                        name="claimCategory"
                        value={formData.claimCategory}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="Accident">Accident</option>
                        <option value="Medical">Medical</option>
                        <option value="Theft">Theft</option>
                        <option value="Fire">Fire</option>
                        <option value="Death">Death</option>
                        <option value="Damage">Damage</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incident / Loss <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        name="dateOfIncident"
                        value={formData.dateOfIncident}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Place of Incident <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="placeOfIncident"
                        value={formData.placeOfIncident}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description of Incident <span className="text-red-500">*</span></label>
                      <textarea
                        name="briefDescription"
                        value={formData.briefDescription}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">FIR / Police Report Available?</label>
                      <select
                        name="firPoliceReportAvailable"
                        value={formData.firPoliceReportAvailable}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
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
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Next
                    </button>
                    </div>
                  </div>
                  </>
                )}

                {/* Step 4: Maturity Details (for Maturity) */}
                {currentStep === 4 && serviceType === 'maturity' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Maturity Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Type <span className="text-red-500">*</span></label>
                    <select
                      name="maturityType"
                      value={formData.maturityType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="Life">Life</option>
                      <option value="Endowment">Endowment</option>
                      <option value="Takaful">Takaful</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Date</label>
                    <input
                      type="date"
                      name="maturityDate"
                      value={formData.maturityDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Maturity Amount (if known)</label>
                    <input
                      type="number"
                      name="expectedMaturityAmount"
                      value={formData.expectedMaturityAmount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bonus / Profit Expected?</label>
                    <select
                      name="bonusProfitExpected"
                      value={formData.bonusProfitExpected}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nominee / Beneficiary Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nomineeBeneficiaryName"
                      value={formData.nomineeBeneficiaryName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship with Policyholder <span className="text-red-500">*</span></label>
                    <select
                      name="relationshipWithPolicyholder"
                      value={formData.relationshipWithPolicyholder}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Self">Self</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
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
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Next
                  </button>
                  </div>
                </div>
                )}

                {/* Step 5: Claim Amount & Provider (for Claim) */}
                {currentStep === 5 && serviceType === 'claim' && (
                  <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Amount & Provider</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Claim Amount (PKR) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        name="estimatedClaimAmount"
                        value={formData.estimatedClaimAmount}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Workshop / Vendor Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="hospitalWorkshopVendorName"
                        value={formData.hospitalWorkshopVendorName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Panel Provider? <span className="text-red-500">*</span></label>
                      <select
                        name="panelProvider"
                        value={formData.panelProvider}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Date(s)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          name="serviceDate"
                          value={formData.serviceDate}
                          onChange={handleChange}
                          placeholder="Start Date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <input
                          type="date"
                          name="serviceDateEnd"
                          value={formData.serviceDateEnd}
                          onChange={handleChange}
                          placeholder="End Date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status <span className="text-red-500">*</span></label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                      </select>
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
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Next
                    </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Maturity Payment & Bank Details (for Maturity) */}
                {currentStep === 5 && serviceType === 'maturity' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Payment & Bank Details</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Mode</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span className="text-red-500">*</span></label>
                          <select
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">Select Payment Mode</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details <span className="text-red-500">*</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Holder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                          <input
                            type="text"
                            name="iban"
                            value={formData.iban}
                            onChange={handleChange}
                            placeholder="PKXX XXXX XXXX XXXX XXXX XXXX"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                          <input
                            type="text"
                            name="branchName"
                            value={formData.branchName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
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
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 6: Documents */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Documents</h2>
              <div className="space-y-4">
                <FileUploadButton fieldName="cnicCopy" label="CNIC Copy" required />
                <FileUploadButton fieldName="policyCopy" label="Policy Copy" required />
                
                {serviceType === 'claim' && (
                  <>
                    <FileUploadButton fieldName="claimForm" label="Claim Form" />
                    {formData.claimCategory === 'Medical' && (
                      <FileUploadButton fieldName="medicalReports" label="Medical Reports" />
                    )}
                    {(formData.claimCategory === 'Accident' || formData.claimCategory === 'Theft') && (
                      <FileUploadButton fieldName="firPoliceReport" label="FIR/Police Report" />
                    )}
                    {formData.claimCategory === 'Death' && (
                      <FileUploadButton fieldName="deathCertificate" label="Death Certificate" />
                    )}
                    {formData.policyType === 'Motor' && (
                      <FileUploadButton fieldName="vehicleRegistration" label="Vehicle Registration" />
                    )}
                    {formData.claimType === 'Reimbursement' && (
                      <FileUploadButton fieldName="billsReceipts" label="Bills/Receipts" />
                    )}
                  </>
                )}
                
                {serviceType === 'maturity' && (
                  <>
                    <FileUploadButton fieldName="maturityClaimForm" label="Maturity Claim Form" />
                    <FileUploadButton fieldName="bankAccountProof" label="Bank Account Proof" />
                    {formData.nomineeBeneficiaryName && (
                      <FileUploadButton fieldName="nomineeCNIC" label="Nominee CNIC" />
                    )}
                  </>
                )}
                
                <FileUploadButton fieldName="otherSupportingDocuments" label="Other Supporting Documents" />
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

                {/* Step 7: Bank Details (for reimbursement claim only) */}
                {currentStep === 7 && serviceType === 'claim' && formData.claimType === 'Reimbursement' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Bank Details <span className="text-red-500">*</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                    <input
                      type="text"
                      name="iban"
                      value={formData.iban}
                      onChange={handleChange}
                      placeholder="PKXX XXXX XXXX XXXX XXXX XXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
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
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Next
                  </button>
                </div>
                  </div>
                )}

                {/* Step 7: Review & Submit (for maturity) or Step 8: Review & Submit (for claim) */}
                {((currentStep === 7 && serviceType === 'maturity') || 
                  (currentStep === 7 && serviceType === 'claim' && formData.claimType !== 'Reimbursement') ||
                  (currentStep === 8 && serviceType === 'claim' && formData.claimType === 'Reimbursement')) && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Authorization & Declaration</h2>
                    <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="authorizationToMadadgaar"
                    checked={formData.authorizationToMadadgaar}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                      <label className="text-sm text-gray-700">
                        I authorize Madadgaar to process my {serviceType} request <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="dataSharingConsent"
                        checked={formData.dataSharingConsent}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
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
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label className="text-sm text-gray-700">
                        I accept the terms and conditions <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Review Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Submission Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Service Type:</strong> {serviceType === 'claim' ? 'Insurance Claim' : 'Maturity Request'}</div>
                      <div><strong>Applicant:</strong> {formData.fullName}</div>
                      <div><strong>CNIC:</strong> {formData.cnic}</div>
                      <div><strong>Policy Number:</strong> {formData.policyNumber}</div>
                      {serviceType === 'claim' && (
                        <>
                          <div><strong>Claim Type:</strong> {formData.claimType}</div>
                          <div><strong>Claim Category:</strong> {formData.claimCategory}</div>
                        </>
                      )}
                      {serviceType === 'maturity' && (
                        <>
                          <div><strong>Maturity Type:</strong> {formData.maturityType}</div>
                          <div><strong>Nominee:</strong> {formData.nomineeBeneficiaryName}</div>
                        </>
                      )}
                      <div><strong>CNIC Copy:</strong> {formData.cnicCopy ? '✓ Uploaded' : '✗ Not uploaded'}</div>
                      <div><strong>Policy Copy:</strong> {formData.policyCopy ? '✓ Uploaded' : '✗ Not uploaded'}</div>
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
                      {loading ? 'Submitting...' : submitted ? 'Submitted!' : `Submit ${serviceType === 'claim' ? 'Claim' : 'Maturity'} Request`}
                    </button>
                  </div>
                </div>
                )}
              </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitClaim;
