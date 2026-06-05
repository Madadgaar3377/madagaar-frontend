import React from "react";

const SIZE_CLASSES = {
  sm: "text-base sm:text-lg",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
  xl: "text-lg sm:text-xl",
};

export function formatPKR(amount, { prefix = "PKR" } = {}) {
  const n = Number(amount) || 0;
  return `${prefix} ${n.toLocaleString()}`;
}

/**
 * Cash / discounted price display:
 * - Single price when only cash or only discounted is set
 * - Discounted + strikethrough cash + % when both are set
 */
export default function CashPriceDisplay({
  display,
  size = "md",
  prefix = "PKR",
  label,
  className = "",
  inline = false,
}) {
  if (!display || Number(display.displayPrice) <= 0) return null;

  const amountClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (display.hasDiscount) {
    if (inline) {
      return (
        <span className={className}>
          <span className={`font-bold text-[rgb(183,36,42)] tabular-nums ${amountClass}`}>
            {formatPKR(display.displayPrice, { prefix })}
          </span>
          <span className="text-gray-400 line-through ml-2 tabular-nums text-sm">
            {formatPKR(display.cashPrice, { prefix })}
          </span>
          {display.discountPercent > 0 && (
            <span className="ml-2 text-green-600 font-semibold text-sm">
              ({display.discountPercent}% off)
            </span>
          )}
        </span>
      );
    }

    return (
      <div className={className}>
        {label && <div className="text-xs text-gray-500 mb-1 font-medium">{label}</div>}
        <div className={`font-bold text-[rgb(183,36,42)] tabular-nums ${amountClass}`}>
          {formatPKR(display.displayPrice, { prefix })}
        </div>
        <div className="text-sm text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="line-through tabular-nums">{formatPKR(display.cashPrice, { prefix })}</span>
          {display.discountPercent > 0 && (
            <span className="text-green-600 font-semibold">{display.discountPercent}% off</span>
          )}
        </div>
      </div>
    );
  }

  if (inline) {
    return (
      <span className={`font-bold text-[rgb(183,36,42)] tabular-nums ${amountClass} ${className}`}>
        {formatPKR(display.displayPrice, { prefix })}
      </span>
    );
  }

  return (
    <div className={className}>
      {label && <div className="text-xs text-gray-500 mb-1 font-medium">{label}</div>}
      <div className={`font-bold text-[rgb(183,36,42)] tabular-nums ${amountClass}`}>
        {formatPKR(display.displayPrice, { prefix })}
      </div>
    </div>
  );
}
