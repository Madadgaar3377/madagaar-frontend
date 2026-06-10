'use client';

import { Suspense } from 'react';
import Page from '../../../../views/clients/Installment/ApplyInstallment';

function ApplyInstallmentFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full size-16 border-b-4 border-red-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading plan details...</p>
      </div>
    </div>
  );
}

export default function ApplyInstallmentPage() {
  return (
    <Suspense fallback={<ApplyInstallmentFallback />}>
      <Page />
    </Suspense>
  );
}
