import React, { useEffect, useMemo, useRef, useState } from "react";
import { ADSENSE_PUBLISHER_ID } from "../constants/adsense";

const isBrowser = typeof window !== "undefined";

function getSlotKey(slot) {
  return `adsense-slot-${slot}`;
}

export default function AdSenseSlot({
  slot,
  className = "",
  style,
  format = "auto",
  layout,
  fullWidthResponsive = true,
  lazy = true,
  minHeightClass = "min-h-[90px]",
  textAlign = "initial",
}) {
  const adRef = useRef(null);
  const observerRef = useRef(null);
  const hasPushedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(!lazy);

  const mergedStyle = useMemo(
    () => ({ display: "block", textAlign, ...(style || {}) }),
    [style, textAlign]
  );

  useEffect(() => {
    if (!lazy || !adRef.current || !isBrowser) return undefined;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0.01,
      }
    );

    observerRef.current.observe(adRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [lazy]);

  useEffect(() => {
    if (!isVisible || hasPushedRef.current || !adRef.current || !isBrowser) return;

    const adElement = adRef.current;
    if (adElement.getAttribute("data-adsbygoogle-status") === "done") {
      hasPushedRef.current = true;
      return;
    }

    if (adElement.dataset.adsRendered === "1") {
      hasPushedRef.current = true;
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adElement.dataset.adsRendered = "1";
      hasPushedRef.current = true;
    } catch (error) {
      // AdSense can throw when blocked; fail silently.
    }
  }, [isVisible]);

  return (
    <div className={`${minHeightClass} ${className}`.trim()}>
      <ins
        ref={adRef}
        key={getSlotKey(slot)}
        className="adsbygoogle"
        style={mergedStyle}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive={String(Boolean(fullWidthResponsive))}
      />
    </div>
  );
}
