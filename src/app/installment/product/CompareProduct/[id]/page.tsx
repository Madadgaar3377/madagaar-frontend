'use client';

import { Suspense } from 'react';
import CompareProducts from '../../../../../views/clients/CompareProduct/CompareProducts';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
          Loading compare…
        </div>
      }
    >
      <CompareProducts />
    </Suspense>
  );
}
