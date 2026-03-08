import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getUser, logout } from '../../../utils/auth';
import { backendBaseUrl } from '../../../constants/apiUrl';
import DashboardNavbar from '../../../components/DashboardNavbar';
import SEO from '../../../components/SEO';
import AnimatedSection from '../../../components/AnimatedSection';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    user: null,
    installments: [],
    properties: [],
    loans: [],
  });

  // Load cached data from localStorage
  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem('dashboardData');
      const cacheTime = localStorage.getItem('dashboardDataTime');
      
      if (cached && cacheTime) {
        const data = JSON.parse(cached);
        const time = parseInt(cacheTime);
        const now = Date.now();
        const cacheAge = now - time;
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          setDashboardData(data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Cache load error:', err);
      return false;
    }
  };

  // Save data to localStorage
  const saveCachedData = (data) => {
    try {
      localStorage.setItem('dashboardData', JSON.stringify(data));
      localStorage.setItem('dashboardDataTime', Date.now().toString());
    } catch (err) {
      console.error('Cache save error:', err);
    }
  };

  const fetchDashboardData = useCallback(async (isCached = false) => {
    try {
      // If we have cached data, show refreshing state instead of loading
      if (isCached) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = getAuthToken();
      const response = await fetch(`${backendBaseUrl}/userDashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const apiMessage = data.message || '';

      if (!response.ok) {
        throw new Error(apiMessage || 'Failed to fetch dashboard data');
      }

      // Backend returned 200 but user not found / invalid session
      if (!data.success && apiMessage.toLowerCase().includes('user not found')) {
        logout('/account');
        return;
      }

      if (data.success) {
        const newData = {
          user: data.data['user Data'] || getUser(),
          installments: data.data.installnments || [],
          properties: data.data.properties || [],
          loans: data.data.loans || [],
        };
        
        setDashboardData(newData);
        
        // Save to cache
        saveCachedData(newData);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const msg = err?.message || '';
      // User not found or Unauthorized: clear session and redirect to login
      if (msg.toLowerCase().includes('user not found') || msg.includes('Unauthorized') || msg.includes('401')) {
        logout('/account');
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto logout and redirect to login when error is "User not found"
  useEffect(() => {
    if (error && String(error).toLowerCase().includes('user not found')) {
      logout('/account');
    }
  }, [error]);

  useEffect(() => {
    // Check authentication
    const token = getAuthToken();
    if (!token) {
      navigate('/account');
      return;
    }

    // Load cached data first (instant load)
    const hasCachedData = loadCachedData();
    
    // If no cache or cache is old, show loading
    if (!hasCachedData) {
      setLoading(true);
    }

    // Always fetch fresh data in background
    fetchDashboardData(hasCachedData);
  }, [navigate, fetchDashboardData]);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'Pending'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = async (application) => {
    if (application?.installmentPlanId != null && application?.applicationId) {
      setDetailsLoading(true);
      setShowDetailsModal(true);
      setSelectedApplication(application);
      try {
        const token = getAuthToken();
        const res = await fetch(`${backendBaseUrl}/getApplication/${application.applicationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data) setSelectedApplication(json.data);
      } catch (err) {
        console.error('Failed to load application details', err);
      } finally {
        setDetailsLoading(false);
      }
    } else {
      setSelectedApplication(application);
      setShowDetailsModal(true);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { user, installments, properties, loans } = dashboardData;
  const totalApplications = installments.length + properties.length + loans.length;

  return (
    <>
      <SEO
        title={`Dashboard - ${user?.name || 'User'} | Madadgaar`}
        description="Manage your applications, view your profile, and track all your property, loan, and installment applications."
        keywords="user dashboard, my applications, profile, madadgaar dashboard"
        noIndex={true}
      />

      <DashboardNavbar />

      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-content">
          {/* Header */}
          <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6">
            <div className="flex justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Manage your applications and track your progress
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                title="Refresh data"
              >
                <svg 
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Updating...' : 'Refresh'}
              </button>
            </div>
          </div>
          </AnimatedSection>

          {/* Stats Cards */}
          <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase">Total Applications</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalApplications}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase">Installments</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{installments.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase">Properties</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{properties.length}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase">Loans</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{loans.length}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          </AnimatedSection>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('installments')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'installments'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Installments ({installments.length})
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'properties'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Properties ({properties.length})
                </button>
                <button
                  onClick={() => setActiveTab('loans')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'loans'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Loans ({loans.length})
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recent Applications</h2>
                  
                  {totalApplications === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Applications Yet</h3>
                      <p className="text-gray-500 mb-6">Start by applying for properties, loans, or installment plans</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => navigate('/properties')}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Browse Properties
                        </button>
                        <button
                          onClick={() => navigate('/loans')}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                          Apply for Loan
                        </button>
                        <button
                          onClick={() => navigate('/installments')}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          View Installments
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Recent Installments */}
                      {installments.slice(0, 3).map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">INSTALLMENT</span>
                                {getStatusBadge(item.status)}
                              </div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.productName || item.planName || 'Installment Plan'}</h3>
                              <p className="text-gray-600 text-xs sm:text-sm mt-1">Applied on {formatDate(item.createdAt)}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(item.amount || item.price)}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Recent Properties */}
                      {properties.slice(0, 3).map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">PROPERTY</span>
                                {getStatusBadge(item.status)}
                              </div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.propertyName || item.title || 'Property'}</h3>
                              <p className="text-gray-600 text-xs sm:text-sm mt-1">Applied on {formatDate(item.createdAt)}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-gray-500">Budget</p>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(item.budget || item.price)}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Recent Loans */}
                      {loans.slice(0, 3).map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">LOAN</span>
                                {getStatusBadge(item.status)}
                              </div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.loanType || 'Loan Application'}</h3>
                              <p className="text-gray-600 text-xs sm:text-sm mt-1">Applied on {formatDate(item.createdAt)}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-gray-500">Loan Amount</p>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(item.loanAmount || item.amount)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Installments Tab */}
              {activeTab === 'installments' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Your Installment Applications</h2>
                  {installments.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No installment applications found</p>
                      <button
                        onClick={() => navigate('/installments')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Browse Installment Plans
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {installments.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                #{item.applicationId || 'N/A'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.PlanInfo?.[0]?.planType || item.productName || item.planName || 'Installment Plan'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.PlanInfo?.[0]?.planPrice || item.amount || item.price)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                {getStatusBadge(item.status)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleViewDetails(item)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Properties Tab */}
              {activeTab === 'properties' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Your Property Applications</h2>
                  {properties.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No property applications found</p>
                      <button
                        onClick={() => navigate('/properties')}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Browse Properties
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {properties.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.propertyName || item.title || 'Property'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.budget || item.price)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                {getStatusBadge(item.status)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(item.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Loans Tab */}
              {activeTab === 'loans' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Your Loan Applications</h2>
                  {loans.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No loan applications found</p>
                      <button
                        onClick={() => navigate('/loans')}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                      >
                        Apply for Loan
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loans.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.loanType || 'Loan Application'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.loanAmount || item.amount)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                {getStatusBadge(item.status)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(item.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Full Name</label>
                        <p className="text-base sm:text-lg text-gray-900 mt-1">{user?.fullName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Email</label>
                        <p className="text-base sm:text-lg text-gray-900 mt-1">{user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Phone</label>
                        <p className="text-base sm:text-lg text-gray-900 mt-1">{user?.phoneNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">User Type</label>
                        <p className="text-base sm:text-lg text-gray-900 mt-1 capitalize">{user?.UserType || user?.userType || 'User'}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">CNIC</label>
                        <p className="text-base sm:text-lg text-gray-900 mt-1">{user?.cnic || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Member Since</label>
                        <p className="text-base sm:text-lg text-gray-900 mt-1">{formatDate(user?.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Application Details</h2>
                <p className="text-sm text-red-100 mt-1">Application ID: #{selectedApplication.applicationId || 'N/A'}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-white hover:bg-red-800 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Application Status */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-600">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase">Application Status</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase">Submitted On</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                  {selectedApplication.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold uppercase">Last Updated</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(selectedApplication.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Plan Information
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  {selectedApplication.PlanInfo && selectedApplication.PlanInfo.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedApplication.PlanInfo[0]?.planpic && (
                        <div className="sm:col-span-2">
                          <img
                            src={selectedApplication.PlanInfo[0].planpic}
                            alt="Plan"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Plan Type</p>
                        <p className="text-base font-bold text-gray-900 mt-1">{selectedApplication.PlanInfo[0]?.planType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Plan Price</p>
                        <p className="text-base font-bold text-blue-600 mt-1">{formatCurrency(selectedApplication.PlanInfo[0]?.planPrice)}</p>
                      </div>
                      {selectedApplication.PlanInfo[1] && (
                        <>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Down Payment</p>
                            <p className="text-base font-bold text-green-600 mt-1">{formatCurrency(selectedApplication.PlanInfo[1].downPayment)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Monthly Installment</p>
                            <p className="text-base font-bold text-red-600 mt-1">{formatCurrency(selectedApplication.PlanInfo[1].monthlyInstallment)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Tenure</p>
                            <p className="text-base font-bold text-gray-900 mt-1">{selectedApplication.PlanInfo[1].tenureMonths || 0} Months</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Interest Rate</p>
                            <p className="text-base font-bold text-gray-900 mt-1">
                              {selectedApplication.PlanInfo[1].interestRatePercent || 0}% 
                              <span className="text-xs font-normal text-gray-600 ml-1">({selectedApplication.PlanInfo[1].interestType || 'N/A'})</span>
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                {selectedApplication.UserInfo && selectedApplication.UserInfo.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Full Name</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">City</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.city || 'N/A'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Address</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">State/Province</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Postal Code</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.zip || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Country</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.country || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Employment Information */}
              {selectedApplication.UserInfo && selectedApplication.UserInfo[0] && (
                selectedApplication.UserInfo[0].occupation || 
                selectedApplication.UserInfo[0].employerName || 
                selectedApplication.UserInfo[0].jobTitle
              ) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Employment Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Occupation</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.occupation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Job Title</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.jobTitle || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Employer Name</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.employerName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Work Contact</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.workContactNumber || 'N/A'}</p>
                      </div>
                      {selectedApplication.UserInfo[0]?.employerAddress && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Employer Address</p>
                          <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0].employerAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Information */}
              {selectedApplication.UserInfo && selectedApplication.UserInfo[0] && (
                selectedApplication.UserInfo[0].monthlyIncome || 
                selectedApplication.UserInfo[0].otherIncomeSources
              ) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Financial Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Monthly Income</p>
                        <p className="text-base font-bold text-green-600 mt-1">{formatCurrency(selectedApplication.UserInfo[0]?.monthlyIncome)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Other Income Sources</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.UserInfo[0]?.otherIncomeSources || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Notes */}
              {selectedApplication.applicationNote && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Application Notes
                  </h3>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-gray-900">{selectedApplication.applicationNote}</p>
                  </div>
                </div>
              )}

              {/* Assigned Agent - full details */}
              {(selectedApplication.agentDetails || selectedApplication.assigenAgent) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Assigned Agent
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    {detailsLoading ? (
                      <p className="text-sm text-gray-500">Loading agent details...</p>
                    ) : selectedApplication.agentDetails ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Name</p>
                          <p className="text-base font-bold text-gray-900 mt-1">{selectedApplication.agentDetails.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Agent ID</p>
                          <p className="text-base font-mono text-gray-900 mt-1">{selectedApplication.agentDetails.userId || selectedApplication.assigenAgent || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                          <a href={`mailto:${selectedApplication.agentDetails.email}`} className="text-base text-blue-600 hover:underline mt-1 block">{selectedApplication.agentDetails.email || 'N/A'}</a>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                          <a href={`tel:${selectedApplication.agentDetails.phoneNumber}`} className="text-base text-gray-900 mt-1 block">{selectedApplication.agentDetails.phoneNumber || 'N/A'}</a>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">WhatsApp</p>
                          <p className="text-base text-gray-900 mt-1">{selectedApplication.agentDetails.WhatsappNumber || 'N/A'}</p>
                        </div>
                        {selectedApplication.agentDetails.Address && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Address</p>
                            <p className="text-base text-gray-900 mt-1">{selectedApplication.agentDetails.Address}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Agent ID</p>
                        <p className="text-base font-bold text-gray-900 mt-1">{selectedApplication.assigenAgent}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned Partner - full details */}
              {selectedApplication.partnerDetails && !detailsLoading && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Partner
                  </h3>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Company / Partner Name</p>
                        <p className="text-base font-bold text-gray-900 mt-1">
                          {selectedApplication.partnerDetails.companyDetails?.RegisteredCompanyName || selectedApplication.partnerDetails.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Contact Name</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.partnerDetails.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                        <a href={`mailto:${selectedApplication.partnerDetails.email}`} className="text-base text-blue-600 hover:underline mt-1 block">{selectedApplication.partnerDetails.email || 'N/A'}</a>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                        <a href={`tel:${selectedApplication.partnerDetails.phoneNumber}`} className="text-base text-gray-900 mt-1 block">{selectedApplication.partnerDetails.phoneNumber || 'N/A'}</a>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">WhatsApp</p>
                        <p className="text-base text-gray-900 mt-1">{selectedApplication.partnerDetails.WhatsappNumber || 'N/A'}</p>
                      </div>
                      {selectedApplication.partnerDetails.companyDetails?.HeadOfficeAddress && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Head Office Address</p>
                          <p className="text-base text-gray-900 mt-1">{selectedApplication.partnerDetails.companyDetails.HeadOfficeAddress}</p>
                        </div>
                      )}
                      {selectedApplication.partnerDetails.companyDetails?.AuthorizedContactPerson?.length > 0 && (
                        <div className="sm:col-span-2 mt-2 pt-2 border-t border-amber-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Authorized Contact</p>
                          {selectedApplication.partnerDetails.companyDetails.AuthorizedContactPerson.slice(0, 2).map((person, idx) => (
                            <div key={idx} className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">{person.fullName || 'N/A'}</span>
                              {person.Designation && <span className="text-gray-500"> ({person.Designation})</span>}
                              {person.phoneNumber && <span> · {person.phoneNumber}</span>}
                              {person.email && <span> · {person.email}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Information */}
              {selectedApplication.approval && selectedApplication.approval.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approval Information
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    {selectedApplication.approval.map((approval, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Approved By</p>
                        <p className="text-base font-bold text-gray-900">{approval.approvedBy || 'N/A'}</p>
                        {approval.approvedAt && (
                          <>
                            <p className="text-xs font-semibold text-gray-600 uppercase mt-2">Approved At</p>
                            <p className="text-base text-gray-900">{formatDate(approval.approvedAt)}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
