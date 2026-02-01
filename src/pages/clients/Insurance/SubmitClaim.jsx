import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getUser, isAuthenticated } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import SEO from '../../../components/SEO';
import { Toast, useToast } from '../../../components/Toast';

const SubmitClaim = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const cnicFileInputRef = useRef(null);
  const policyFileInputRef = useRef(null);
  const documentFileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState({ type: '', status: false });
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  
  const [serviceType, setServiceType] = useState('claim'); // 'claim' or 'maturity'
  
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
    estimatedClaimAmount: '',
    
    // Maturity Details
    maturityType: 'Life',
    maturityDate: '',
    expectedMaturityAmount: '',
    nomineeBeneficiaryName: '',
    relationshipWithPolicyholder: '',
    
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

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/account');
    }
  }, [navigate]);

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
          estimatedClaimAmount: formData.estimatedClaimAmount ? Number(formData.estimatedClaimAmount) : undefined,
        } : undefined,
        maturityDetails: serviceType === 'maturity' ? {
          maturityType: formData.maturityType,
          maturityDate: formData.maturityDate || undefined,
          expectedMaturityAmount: formData.expectedMaturityAmount ? Number(formData.expectedMaturityAmount) : undefined,
          nomineeBeneficiaryName: formData.nomineeBeneficiaryName || undefined,
          relationshipWithPolicyholder: formData.relationshipWithPolicyholder || undefined,
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
        <div className="container-content max-w-4xl">
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

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Submit {serviceType === 'claim' ? 'Insurance Claim' : 'Maturity Request'}
              </h1>
              
              {/* Service Type Toggle */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setServiceType('claim')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    serviceType === 'claim'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Claim
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('maturity')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    serviceType === 'maturity'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Maturity
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6">
            {/* Applicant Information */}
            <div>
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
            </div>

            {/* Policy Information */}
            <div>
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
            </div>

            {/* Claim Details */}
            {serviceType === 'claim' && (
              <div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incident</label>
                    <input
                      type="date"
                      name="dateOfIncident"
                      value={formData.dateOfIncident}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place of Incident</label>
                    <input
                      type="text"
                      name="placeOfIncident"
                      value={formData.placeOfIncident}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
                    <textarea
                      name="briefDescription"
                      value={formData.briefDescription}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Claim Amount</label>
                    <input
                      type="number"
                      name="estimatedClaimAmount"
                      value={formData.estimatedClaimAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Maturity Details */}
            {serviceType === 'maturity' && (
              <div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Maturity Amount</label>
                    <input
                      type="number"
                      name="expectedMaturityAmount"
                      value={formData.expectedMaturityAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nominee/Beneficiary Name</label>
                    <input
                      type="text"
                      name="nomineeBeneficiaryName"
                      value={formData.nomineeBeneficiaryName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship with Policyholder</label>
                    <input
                      type="text"
                      name="relationshipWithPolicyholder"
                      value={formData.relationshipWithPolicyholder}
                      onChange={handleChange}
                      placeholder="e.g., Spouse, Child, Parent"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            <div>
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
            </div>

            {/* Bank Details (for maturity or reimbursement) */}
            {(serviceType === 'maturity' || 
              (serviceType === 'claim' && formData.claimType === 'Reimbursement')) && (
              <div>
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
              </div>
            )}

            {/* Authorization */}
            <div>
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
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : `Submit ${serviceType === 'claim' ? 'Claim' : 'Maturity'} Request`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SubmitClaim;
