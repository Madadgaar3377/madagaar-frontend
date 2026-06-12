import React from 'react';

export function FormSection({ title, description, children }) {
  return (
    <section className="p-5 sm:p-6 border-b border-gray-100 last:border-b-0">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
        {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function ReviewBlock({ title, rows }) {
  const visible = rows.filter((r) => r.value && String(r.value).trim());
  if (!visible.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {visible.map((row) => (
          <div key={row.label} className={row.full ? 'sm:col-span-2' : ''}>
            <dt className="text-gray-500">{row.label}</dt>
            <dd className="font-medium text-gray-900 mt-0.5 break-words">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm';
export const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
