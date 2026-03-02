import React from 'react';

/**
 * SkeletonLoader Component
 * Displays loading placeholders for different content types
 */

// Team Member Card Skeleton
export const TeamMemberSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 skeleton-pulse">
      {/* Image Section */}
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      
      {/* Info Section */}
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        
        {/* Social Links */}
        <div className="flex justify-center gap-3 mt-4">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};

// Property Card Skeleton
export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 skeleton-pulse">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
        </div>
      </div>
    </div>
  );
};

// Installment Card Skeleton
export const InstallmentCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 skeleton-pulse">
      {/* Image */}
      <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      
      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-full"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
        
        <div className="flex gap-2 pt-2">
          <div className="h-6 sm:h-7 bg-gray-200 rounded w-20"></div>
          <div className="h-6 sm:h-7 bg-gray-200 rounded w-16"></div>
        </div>
        
        <div className="h-8 sm:h-9 bg-gray-200 rounded w-full mt-2"></div>
      </div>
    </div>
  );
};

// Loan Card Skeleton
export const LoanCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 skeleton-pulse">
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

// Generic Card Skeleton
export const CardSkeleton = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-gray-100 skeleton-pulse ${className}`}>
      <div className="p-4 sm:p-6 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

// Grid Skeleton Loader
export const GridSkeletonLoader = ({ 
  count = 6, 
  SkeletonComponent = CardSkeleton,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
}) => {
  return (
    <div className={`grid ${columns} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};

export default {
  TeamMemberSkeleton,
  PropertyCardSkeleton,
  InstallmentCardSkeleton,
  LoanCardSkeleton,
  CardSkeleton,
  GridSkeletonLoader
};
