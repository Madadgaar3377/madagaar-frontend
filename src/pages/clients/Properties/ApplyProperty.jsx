import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthToken, getUser, isAuthenticated } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import SEO from '../../../components/SEO';
import { Toast, useToast } from '../../../components/Toast';

const ApplyProperty = () => {
  const { id } = useParams(); // property ID
  const navigate = useNavigate();
  const currentUser = getUser();
  
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [property, setProperty] = useState(null);
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    number: currentUser?.phoneNumber || '',
    whatsApp: currentUser?.WhatsappNumber || '',
    cnic: currentUser?.cnicNumber || '',
    city: '',
    area: '',
    reference: '',
    applicationNote: '',
  });

  const fetchPropertyDetails = useCallback(async () => {
    try {
      setLoadingProperty(true);
      const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/getAllProperties`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load properties');
      }

      const allProperties = data.properties || [];
      const foundProperty = allProperties.find(p => 
        p._id === id || 
        p._id?.toString() === id ||
        p.project?.propertyId === id ||
        p.individualProperty?.propertyId === id
      );

      if (!foundProperty) {
        throw new Error('Property not found');
      }

      // Extract property data
      let propertyData = {};
      if (foundProperty.type === "Individual" && foundProperty.individualProperty) {
        propertyData = {
          _id: foundProperty._id,
          type: "Individual",
          propertyId: foundProperty.individualProperty.propertyId,
          title: foundProperty.individualProperty.title,
          propertyType: foundProperty.individualProperty.propertyType,
          city: foundProperty.individualProperty.city,
          location: foundProperty.individualProperty.location,
          price: foundProperty.individualProperty.transaction?.price || foundProperty.individualProperty.transaction?.monthlyRent,
          images: foundProperty.individualProperty.images || [],
        };
      } else if (foundProperty.type === "Project" && foundProperty.project) {
        propertyData = {
          _id: foundProperty._id,
          type: "Project",
          propertyId: foundProperty.project.propertyId,
          title: foundProperty.project.projectName,
          propertyType: foundProperty.project.projectType,
          city: foundProperty.project.city,
          location: foundProperty.project.area || foundProperty.project.address,
          price: foundProperty.project.transaction?.priceRange || foundProperty.project.transaction?.price,
          images: foundProperty.project.images || [],
        };
      }

      if (!propertyData.propertyId) {
        throw new Error('Property ID not found');
      }

      setProperty(propertyData);
      
      // Auto-fill city if available
      if (propertyData.city) {
        setFormData(prev => ({ ...prev, city: propertyData.city }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load property details');
    } finally {
      setLoadingProperty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/account');
      return;
    }
    fetchPropertyDetails();
  }, [fetchPropertyDetails, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.number) {
      showError('Please fill in required fields (Name, Email, Phone)');
      return false;
    }

    if (!formData.cnic) {
      showError('Please provide your CNIC number');
      return false;
    }

    if (!formData.city) {
      showError('Please provide your city');
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
      
      if (!property || !property.propertyId) {
        throw new Error('Property information is missing');
      }

      // Backend expects { data: {...} } format
      // The entire data object gets stored in applicationData: [JSON.stringify(data)]
      const applicationData = {
        data: {
          type: property.type, // "Project" or "Individual"
          propertyId: property.propertyId,
          assigenAgent: '', // Optional - backend will auto-assign if empty
          applicationNote: formData.applicationNote || undefined,
          // Include user form data in the data object
          name: formData.name,
          email: formData.email,
          number: formData.number,
          whatsApp: formData.whatsApp || undefined,
          cnic: formData.cnic,
          city: formData.city,
          area: formData.area || undefined,
          reference: formData.reference || undefined,
        },
      };

      const response = await fetch(`${backendBaseUrl}/applyProperty`, {
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

      showSuccess('Property application submitted successfully! Our agent will contact you soon.');
      
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

  if (loadingProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <>
        <Toast toasts={toasts} onClose={removeToast} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/properties')}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Browse Properties
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const formatPrice = (price) => {
    if (!price) return 'Contact for Price';
    if (typeof price === 'string') return price;
    return `PKR ${price.toLocaleString()}`;
  };

  return (
    <>
      <Toast toasts={toasts} onClose={removeToast} />
      <SEO
        title={`Apply for ${property.title} | Madadgaar`}
        description={`Apply for ${property.title} - ${property.propertyType} in ${property.city}. Submit your application now.`}
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
              Apply for Property
            </h1>
            <p className="text-gray-600 mt-2 text-responsive-sm">Complete the form below to apply for this property</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Summary</h2>
                
                {property.images && property.images[0] && (
                  <div className="aspect-video w-full mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900">{property.propertyType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Category:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      property.type === 'Project' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {property.type}
                    </span>
                  </div>
                  {property.city && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">City:</span>
                      <span className="font-semibold text-gray-900">{property.city}</span>
                    </div>
                  )}
                  {property.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold text-gray-900">{property.location}</span>
                    </div>
                  )}
                  {property.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-red-600">{formatPrice(property.price)}</span>
                    </div>
                  )}
                </div>
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
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="number"
                        value={formData.number}
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
                        name="whatsApp"
                        value={formData.whatsApp}
                        onChange={handleChange}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC Number *
                      </label>
                      <input
                        type="text"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        required
                        placeholder="12345-1234567-1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area
                      </label>
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        placeholder="Area/Locality"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reference
                      </label>
                      <input
                        type="text"
                        name="reference"
                        value={formData.reference}
                        onChange={handleChange}
                        placeholder="How did you hear about us?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes (Optional)</h2>
                  <textarea
                    name="applicationNote"
                    value={formData.applicationNote}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any additional information you'd like to share about your property interest..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
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

export default ApplyProperty;
