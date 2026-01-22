import React, { useState, useEffect } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { isAuthenticated, getAuthToken, getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const InstallmentReviews = ({ installmentPlanId, planId }) => {
  const navigate = useNavigate();
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

  // Fetch reviews
  useEffect(() => {
    const id = getPlanId();
    if (!id) {
      setLoading(false);
      setError("Installment plan ID is required to load reviews");
      return;
    }
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installmentPlanId, planId, page]);

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
      // Use the ID directly - backend will handle both installmentPlanId string and _id ObjectId
      const res = await fetch(`${apiUrl}/getInstallmentReviews/${encodeURIComponent(String(id))}?status=approved&page=${page}&limit=10&sortBy=createdAt&sortOrder=desc`);
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
        // Response is successful (could be data.success === true or data.success is undefined but has data)
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
      navigate("/account");
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
        fetchReviews();
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
      navigate("/account");
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 w-full">
          <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">⭐</span>
            <span>Customer Reviews</span>
          </h3>
          {statistics.total > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{statistics.averageRating.toFixed(1)}</span>
                  <span className="text-sm sm:text-base text-gray-500">/ 5</span>
                </div>
                <div className="flex gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= Math.round(statistics.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">({statistics.total} {statistics.total === 1 ? 'review' : 'reviews'})</span>
              </div>
          )}
        </div>
        {isAuthenticated() && !userReviews.length && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 lg:py-3 bg-[rgb(183,36,42)] text-white rounded-lg font-semibold hover:bg-red-700 transition text-xs sm:text-sm lg:text-base whitespace-nowrap"
            >
              Write a Review
            </button>
          )}
      </div>

      {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Rating Distribution */}
        {statistics.total > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-200">
            <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700 mb-2 sm:mb-3">Rating Distribution</h4>
            <div className="space-y-1.5 sm:space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = statistics.ratingDistribution[rating] || 0;
                const percentage = statistics.total > 0 ? (count / statistics.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 flex-shrink-0">{rating} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 sm:w-12 text-right flex-shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-200">
            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              {editingReview ? "Edit Your Review" : "Write a Review"}
            </h4>
            <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Rating *</label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-transparent"
                  placeholder="Brief summary of your experience"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Comment *</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-transparent resize-y"
                  rows={4}
                  placeholder="Share your experience with this product..."
                  required
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1">{formData.comment.length}/2000</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-[rgb(183,36,42)] text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 text-sm sm:text-base"
                >
                  {submitting ? "Submitting..." : editingReview ? "Update Review" : "Submit Review"}
                </button>
                <button
                  type="button"
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
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List - Always Show */}
        {loading ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(183,36,42)] mb-2"></div>
            <p>Loading reviews...</p>
          </div>
        ) : error && !reviews.length ? (
          <div className="text-center py-8 sm:py-12">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-red-600">{error}</p>
            <button
              onClick={fetchReviews}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[rgb(183,36,42)] text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm sm:text-base"
            >
              Retry Loading Reviews
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
            {isAuthenticated() && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[rgb(183,36,42)] text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm sm:text-base"
              >
                Write the First Review
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {reviews.map((review) => {
                const isOwnReview = currentUser?.userId === review.userId;
                const isHelpful = review.helpfulUsers?.includes(currentUser?.userId);
                
                return (
                  <div 
                    key={review._id || review.reviewId} 
                    className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 hover:shadow-md hover:border-[rgb(183,36,42)] transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0">
                        {review.userProfileImage ? (
                          <img 
                            src={review.userProfileImage} 
                            alt={review.userName || "User"} 
                            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-[rgb(183,36,42)] to-red-600 flex items-center justify-center font-bold text-white text-sm sm:text-base lg:text-lg ${review.userProfileImage ? 'hidden' : ''}`}>
                          {review.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2 sm:mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{review.userName || "Anonymous"}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <div className="flex gap-0.5 sm:gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {isOwnReview && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.reviewId || review._id)}
                                className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {review.title && (
                          <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">{review.title}</h5>
                        )}
                        
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                        
                        {review.reviewImages && review.reviewImages.length > 0 && (
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {review.reviewImages.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Review ${idx + 1}`}
                                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg border border-gray-200 hover:scale-105 transition"
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 sm:gap-4 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleMarkHelpful(review.reviewId || review._id)}
                            className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition px-2 py-1 rounded-lg ${
                              isHelpful 
                                ? 'text-[rgb(183,36,42)] bg-red-50' 
                                : 'text-gray-500 hover:text-[rgb(183,36,42)] hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Helpful ({review.helpfulCount || 0})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[rgb(183,36,42)] transition"
                  >
                    Previous
                  </button>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[rgb(183,36,42)] transition"
                  >
                    Next
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
