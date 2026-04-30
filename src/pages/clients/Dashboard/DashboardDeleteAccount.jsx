import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendBaseUrl } from '../../../constants/apiUrl';
import DashboardNavbar from '../../../components/DashboardNavbar';
import SEO from '../../../components/SEO';
import { getAuthToken, logout } from '../../../utils/auth';

const DashboardDeleteAccount = () => {
  const navigate = useNavigate();

  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = getAuthToken();

  const canSubmit = confirmText.trim().toUpperCase() === 'DELETE' && !loading;

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion.');
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      const response = await fetch(`${backendBaseUrl}/deleteAccount`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim() || 'User requested account deletion from dashboard',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete account');
      }

      setSuccess('Account deleted successfully. Redirecting to login...');

      setTimeout(() => {
        logout('/account');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Delete Account | Madadgaar Dashboard"
        description="How to request deletion of your Madadgaar account and associated data."
      />

      {token && <DashboardNavbar />}

      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-content max-w-3xl">
          {!token ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Madadgaar Account Deletion</h1>
              <p className="text-gray-600 mt-2">
                This page explains how Madadgaar users can request account and data deletion.
              </p>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">How to request deletion</h2>
                <ol className="list-decimal pl-5 mt-2 text-gray-700 space-y-1">
                  <li>Sign in to your Madadgaar account.</li>
                  <li>Open this page while signed in.</li>
                  <li>Type <strong>DELETE</strong> and submit the request.</li>
                </ol>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">What data is deleted</h2>
                <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                  <li>Profile details and account access data linked to your account.</li>
                  <li>User dashboard access and associated personal account records.</li>
                </ul>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">What data may be retained</h2>
                <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                  <li>Compliance, anti-fraud, and security audit logs where legally required.</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  Retention period: up to <strong>90 days</strong>, or longer if required by law.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/account')}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Sign In to Delete Account
                </button>
                <a
                  href="mailto:support@madadgaar.com.pk"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
                >
                  Contact Support
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Delete Account</h1>
                <p className="text-gray-600 mt-2">
                  This action is permanent. You will lose access to your account and dashboard data.
                </p>
              </div>

              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md border border-red-100">
                <div className="p-6 border-b border-red-100 bg-red-50 rounded-t-lg">
                  <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                  <p className="text-sm text-red-600 mt-1">
                    Please make sure before deleting your account. This cannot be undone.
                  </p>
                </div>

                <form onSubmit={handleDeleteAccount} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (optional)
                    </label>
                    <textarea
                      rows="4"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Tell us why you are leaving..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="font-bold">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/security')}
                      className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Deleting Account...' : 'Delete My Account'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardDeleteAccount;
