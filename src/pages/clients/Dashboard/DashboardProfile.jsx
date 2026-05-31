import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getUser, setAuthData } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import DashboardNavbar from '../../../components/DashboardNavbar';
import SEO from '../../../components/SEO';

const DashboardProfile = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(currentUser?.profilePic || '');
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    userName: currentUser?.userName || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    WhatsappNumber: currentUser?.WhatsappNumber || '',
    cnicNumber: currentUser?.cnicNumber || '',
    Address: currentUser?.Address || '',
  });

  useEffect(() => {
    // Check authentication
    const token = getAuthToken();
    if (!token) {
      navigate('/account');
    }
  }, [navigate]);

  const updateFormField = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload image
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    setError('');

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${backendBaseUrl}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload image');
      }

      // Set the uploaded image URL
      setImagePreview(data.url);

      // Update user profile with new image
      await updateProfilePicture(data.url);

    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message);
      setImagePreview(currentUser?.profilePic || '');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateProfilePicture = async (imageUrl) => {
    try {
      const token = getAuthToken();
      const userId = currentUser?.userId;

      const response = await fetch(`${backendBaseUrl}/updateUser`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          updates: { profilePic: imageUrl }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile picture');
      }

      // Update local storage
      setAuthData(token, data.user);
      setSuccess('Profile picture updated successfully!');

    } catch (err) {
      console.error('Profile picture update error:', err);
      throw err;
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setUploadingImage(true);
    try {
      const token = getAuthToken();
      const userId = currentUser?.userId;

      const response = await fetch(`${backendBaseUrl}/updateUser`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          updates: { profilePic: '' }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove profile picture');
      }

      setImagePreview('');
      setAuthData(token, data.user);
      setSuccess('Profile picture removed successfully!');

    } catch (err) {
      console.error('Remove image error:', err);
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      const userId = currentUser?.userId;

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      // Prepare updates object (only changed fields)
      const updates = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== currentUser[key] && formData[key] !== '') {
          updates[key] = formData[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        setError('No changes detected');
        setLoading(false);
        return;
      }

      const response = await fetch(`${backendBaseUrl}/updateUser`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          updates: updates
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage with new user data
      setAuthData(token, data.user);
      
      setSuccess('Profile updated successfully!');
      
      // Reload user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Profile Settings | Madadgaar Dashboard"
        description="Update your profile information and personal details"
        noIndex={true}
      />
      
      <DashboardNavbar />
      
      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-content max-w-4xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Update your personal information and contact details</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              {/* Profile Picture Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Display */}
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="size-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="size-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                        {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full size-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {imagePreview ? 'Change Picture' : 'Upload Picture'}
                        </button>

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={uploadingImage}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Recommended: Square image, at least 200x200px. Max size: 5MB
                      </p>
                      <p className="text-xs text-gray-500">
                        Accepted formats: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={updateFormField}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input id="userName"
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={updateFormField}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={updateFormField}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="cnicNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      CNIC Number
                    </label>
                    <input id="cnicNumber"
                      type="text"
                      name="cnicNumber"
                      value={formData.cnicNumber}
                      onChange={updateFormField}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="12345-1234567-1"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={updateFormField}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label htmlFor="WhatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input id="WhatsappNumber"
                      type="tel"
                      name="WhatsappNumber"
                      value={formData.WhatsappNumber}
                      onChange={updateFormField}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="Address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea id="Address"
                      name="Address"
                      value={formData.Address}
                      onChange={updateFormField}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>
              </div>

              {/* User Info Display */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">User ID</label>
                    <p className="text-sm text-gray-900 font-mono">{currentUser?.userId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">User Type</label>
                    <p className="text-sm text-gray-900 capitalize">{currentUser?.UserType || currentUser?.userType || 'User'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Account Status</label>
                    <p className="text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        currentUser?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currentUser?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email Verified</label>
                    <p className="text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        currentUser?.emailVerify ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentUser?.emailVerify ? 'Verified' : 'Not Verified'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-white flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full size-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardProfile;
