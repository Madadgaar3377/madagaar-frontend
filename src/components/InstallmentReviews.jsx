import React, { useState, useEffect, useMemo } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { isAuthenticated, getAuthToken, getUser } from "../utils/auth";
import { useRouter } from 'next/navigation';
const InstallmentReviews = ({ installmentPlanId, planId }) => {
  const router = useRouter();
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helper to check if string is a valid MongoDB ObjectId (24 hex chars)
  const isValidObjectId = (str) => {
    if (!str) return false;
    const strVal = String(str);
    return /^[0-9a-fA-F]{24}$/.test(strVal);
  };

  // Get the correct ID to use - prefer installmentPlanId (string) over planId (ObjectId)
  // The backend has a bug where it tries to cast non-ObjectId strings to ObjectId
  // So we MUST use installmentPlanId if it exists, otherwise use planId only if it's a valid ObjectId
  const getPlanId = () => {
    // Always prefer installmentPlanId if it exists (it's the custom string ID)
    if (installmentPlanId) {
      return installmentPlanId;
    }
    // Only use planId if it's a valid ObjectId format
    if (planId && isValidObjectId(planId)) {
      return planId;
    }
    // Last resort fallback
    return planId;
  };

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    reviewCategories: {
      value: 5,
      quality: 5,
      service: 5,
      delivery: 5
    },
    reviewImages: []
  });

  const resolvedPlanId = useMemo(() => getPlanId(), [installmentPlanId, planId]);
  const missingPlanId = !resolvedPlanId;
  const resolvedError = missingPlanId
    ? "Installment plan ID is required to load reviews"
    : error;
  const resolvedLoading = missingPlanId ? false : loading;

  // Fetch reviews
  useEffect(() => {
    if (!resolvedPlanId) return;
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPlanId, page]);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const id = getPlanId();
      if (!id) {
        setError("Installment plan ID is required");
        setLoading(false);
        return;
      }
      
      // Fetch approved reviews (all reviews are now auto-approved)
      // Using timestamp in URL for cache-busting instead of headers to avoid CORS issues
      const res = await fetch(`${apiUrl}/getInstallmentReviews/${encodeURIComponent(String(id))}?status=approved&page=${page}&limit=10&sortBy=createdAt&sortOrder=desc&_t=${Date.now()}`);
      const data = await res.json();
      
      // Debug logging
      console.log('Reviews API Response:', { 
        data, 
        id, 
        installmentPlanId, 
        planId,
        responseStatus: res.status,
        responseOk: res.ok
      });
      
      // Handle different response structures
      if (data.success !== false) {
        const reviewsData = data.data?.reviews || data.reviews || [];
        const existingStats = data.data?.statistics || data.statistics || {};
        const paginationData = data.data?.pagination || data.pagination || { totalPages: 1 };
        
        // Calculate rating distribution from reviews if not provided
        let ratingDistribution = existingStats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (reviewsData.length > 0 && Object.values(ratingDistribution).every(v => v === 0)) {
          ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach(r => {
            const rating = Math.round(r.rating || 0);
            if (rating >= 1 && rating <= 5) {
              ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
            }
          });
        }
        
        // Build statistics object
        const statsData = {
          total: existingStats.total !== undefined ? existingStats.total : reviewsData.length,
          averageRating: existingStats.averageRating !== undefined ? existingStats.averageRating : 
            (reviewsData.length > 0 ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length : 0),
          ratingDistribution: ratingDistribution
        };
        
        setReviews(reviewsData);
        setStatistics(statsData);
        setTotalPages(paginationData.totalPages || 1);
      } else {
        setError(data.message || "Failed to load reviews");
        setReviews([]);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      router.push("/account");
      return;
    }

    if (!formData.comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = getAuthToken();
      const id = getPlanId();
      if (!id) {
        setError("Installment plan ID is required");
        return;
      }
      
      const url = editingReview 
        ? `${apiUrl}/updateInstallmentReview/${editingReview.reviewId || editingReview._id}`
        : `${apiUrl}/createInstallmentReview`;
      
      const method = editingReview ? "PUT" : "POST";
      
      // Ensure we send the correct ID format
      // The backend has a bug where it tries to cast installmentPlanId to ObjectId in the _id field
      // So we MUST send installmentPlanId (the custom string) if it exists
      const reviewPayload = editingReview ? {} : { 
        // Always use installmentPlanId if available, otherwise use planId
        installmentPlanId: installmentPlanId || String(planId || id)
      };
      
      // Debug: Log what we're sending
      if (process.env.NODE_ENV === 'development') {
        console.log("Submitting review with payload:", {
          installmentPlanId: reviewPayload.installmentPlanId,
          hasInstallmentPlanId: !!installmentPlanId,
          hasPlanId: !!planId,
          installmentPlanIdValue: installmentPlanId,
          planIdValue: planId
        });
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...reviewPayload,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
          reviewCategories: formData.reviewCategories,
          reviewImages: formData.reviewImages
        })
      });

      const data = await res.json();

      if (data.success) {
        setShowReviewForm(false);
        setEditingReview(null);
        setFormData({
          rating: 5,
          title: "",
          comment: "",
          reviewCategories: { value: 5, quality: 5, service: 5, delivery: 5 },
          reviewImages: []
        });
        // Wait a moment for backend to process, then refresh reviews
        setTimeout(() => {
          fetchReviews();
        }, 500);
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated()) {
      router.push("/account");
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${apiUrl}/markReviewHelpful/${encodeURIComponent(reviewId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Error marking helpful:", err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${apiUrl}/deleteInstallmentReview/${encodeURIComponent(reviewId)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        setError(data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || "",
      comment: review.comment,
      reviewCategories: review.reviewCategories || { value: 5, quality: 5, service: 5, delivery: 5 },
      reviewImages: review.reviewImages || []
    });
    setShowReviewForm(true);
  };

  const currentUser = getUser();
  const userReviews = reviews.filter(r => r.userId === currentUser?.userId);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
              <p className="text-sm text-gray-500 mt-0.5">Share your experience with this product</p>

              {statistics.total > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 tabular-nums">{statistics.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">/ 5</span>
                  </div>
                  <div className="flex gap-0.5" aria-hidden>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`size-4 ${star <= Math.round(statistics.averageRating) ? "text-amber-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {statistics.total} {statistics.total === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isAuthenticated() && !userReviews.length && (
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[rgb(183,36,42)] text-white text-sm font-semibold hover:bg-red-700 transition-colors w-full sm:w-auto"
            >
              <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Write a review
            </button>
          )}
        </div>
      </div>

      {resolvedError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {resolvedError}
          </div>
        )}

        {statistics.total > 0 && (
          <div className="mb-4 p-4 sm:p-5 bg-white rounded-xl border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Rating breakdown</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = statistics.ratingDistribution[rating] || 0;
                const percentage = statistics.total > 0 ? (count / statistics.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 w-14 sm:w-16 shrink-0 text-xs text-gray-600">
                      <span className="font-medium tabular-nums">{rating}</span>
                      <svg className="size-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-14 sm:w-16 text-right text-xs text-gray-600 tabular-nums">
                      {count}{" "}
                      <span className="text-gray-400">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Form - Enhanced */}
        {showReviewForm && (
          <div className="mb-6 p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="size-10 bg-gradient-to-br from-[rgb(183,36,42)] to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </h4>
              <button type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({
                    rating: 5,
                    title: "",
                    comment: "",
                    reviewCategories: { value: 5, quality: 5, service: 5, delivery: 5 },
                    reviewImages: []
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitReview} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-bold text-gray-900 mb-3">Your Rating *</label>
                <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`size-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
                        star <= formData.rating 
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20" className="size-7 sm:w-8 sm:h-8">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                  {formData.rating === 5 && "Excellent"}
                  {formData.rating === 4 && "Very Good"}
                  {formData.rating === 3 && "Good"}
                  {formData.rating === 2 && "Fair"}
                  {formData.rating === 1 && "Poor"}
                </p>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">Review Title (Optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition-all bg-white"
                  placeholder="Give your review a catchy title..."
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">Your Review *</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] resize-y transition-all bg-white"
                  rows={6}
                  placeholder="Share your detailed experience with this product. What did you like? What could be improved?"
                  required
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    {formData.comment.length > 0 && (
                      <span className={formData.comment.length > 1800 ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                        {formData.comment.length}/2000 characters
                      </span>
                    )}
                  </div>
                  {formData.comment.length === 0 && (
                    <span className="text-xs text-gray-400">Required field</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting || !formData.comment.trim()}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : editingReview ? (
                    <>
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Review
                    </>
                  ) : (
                    <>
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List - Always Show */}
        {resolvedLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="relative size-10">
              <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[rgb(183,36,42)] animate-spin" />
            </div>
            <p className="text-sm text-gray-600">Loading reviews…</p>
          </div>
        ) : resolvedError && !reviews.length ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-red-800">{resolvedError}</p>
            <button
              type="button"
              onClick={fetchReviews}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[rgb(183,36,42)] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-6 text-center">
            <p className="text-sm text-gray-600">
              No reviews yet. Be the first to share your experience with this product.
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {reviews.map((review) => {
                const isOwnReview = currentUser?.userId === review.userId;
                const isHelpful = review.helpfulUsers?.includes(currentUser?.userId);
                
                return (
                  <div 
                    key={review._id || review.reviewId} 
                    className="group bg-white rounded-2xl border-2 border-gray-100 p-5 sm:p-6 hover:border-[rgb(183,36,42)] hover:shadow-xl transition-all duration-300"
                  >
                    {/* Review Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 relative">
                        {review.userProfileImage ? (
                          <img 
                            src={review.userProfileImage} 
                            alt={review.userName || "User"} 
                            className="size-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200 shadow-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`size-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[rgb(183,36,42)] to-red-600 flex items-center justify-center font-black text-white text-lg sm:text-xl shadow-lg ${review.userProfileImage ? 'hidden' : ''}`}>
                          {review.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        {isOwnReview && (
                          <div className="absolute -bottom-1 -right-1 size-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">{review.userName || "Anonymous"}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`size-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 font-medium">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          
                          {isOwnReview && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button type="button"
                                onClick={() => handleEditReview(review)}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                title="Edit review"
                              >
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button type="button"
                                onClick={() => handleDeleteReview(review.reviewId || review._id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Delete review"
                              >
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Review Content */}
                    <div className="space-y-3">
                      {review.title && (
                        <h5 className="font-bold text-lg text-gray-900">{review.title}</h5>
                      )}
                      
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{review.comment}</p>
                      
                      {review.reviewImages && review.reviewImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {review.reviewImages.map((img, idx) => (
                            <div key={idx} className="relative group/img">
                              <img
                                src={img}
                                alt={`Review ${idx + 1}`}
                                className="size-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-gray-200 hover:border-[rgb(183,36,42)] transition-all cursor-pointer hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Review Footer */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                      <button type="button"
                        onClick={() => handleMarkHelpful(review.reviewId || review._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                          isHelpful 
                            ? 'text-[rgb(183,36,42)] bg-red-50 border-2 border-red-200' 
                            : 'text-gray-600 hover:text-[rgb(183,36,42)] hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <svg className={`size-5 ${isHelpful ? 'fill-current' : ''}`} fill={isHelpful ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Helpful
                        <span className="font-bold">({review.helpfulCount || 0})</span>
                      </button>
                      
                      {review.isVerified && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                          <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Purchase
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination - Enhanced */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-gray-200">
                <div className="text-sm font-semibold text-gray-700">
                  Page <span className="text-[rgb(183,36,42)] font-black">{page}</span> of <span className="text-[rgb(183,36,42)] font-black">{totalPages}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 text-sm font-bold border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[rgb(183,36,42)] hover:text-[rgb(183,36,42)] transition-all disabled:hover:border-gray-300 disabled:hover:text-gray-500 flex items-center gap-2"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button type="button"
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`size-10 rounded-xl font-bold text-sm transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button type="button"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-5 py-2.5 text-sm font-bold border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[rgb(183,36,42)] hover:text-[rgb(183,36,42)] transition-all disabled:hover:border-gray-300 disabled:hover:text-gray-500 flex items-center gap-2"
                  >
                    Next
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            </div>
        )}
    </div>
  );
};

export default InstallmentReviews;
