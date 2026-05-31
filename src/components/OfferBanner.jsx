import React, { useState, useEffect, useCallback } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import SaleCountdown from "./SaleCountdown";

/**
 * Offer banners carousel – same data as mobile app (getAllOffers).
 */
const ACCENT = "#b7242a";
const ACCENT_RGB = "183, 36, 42";

const normalizeBanners = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((b) => b && (b.image || b.imageUrl || b.image_url))
    .map((b) => ({
      id: b._id || b.id || String(Math.random()),
      title: b.title || b.name || b.category || "Special Offer",
      description: b.description || b.desc || "",
      imageUrl: b.imageUrl || b.image || b.image_url || "",
      link: b.link || b.url || b.redirectUrl || "",
    }));
};

const truncate = (text, maxLen = 42) => {
  if (!text || typeof text !== "string") return "";
  const t = text.trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen).trim() + "…";
};

const isPlaceholderTitle = (title) => {
  if (!title || typeof title !== "string") return true;
  const t = title.trim().toLowerCase();
  return t === "" || t === "hero slider" || t === "hero slider ";
};

export default function OfferBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchBanners = useCallback(async () => {
    const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
    try {
      const res = await fetch(`${apiUrl}/getAllOffers`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : data?.data || data?.offers || data?.banners || [];
      setBanners(normalizeBanners(list));
    } catch (err) {
      console.error("OfferBanner fetch error:", err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const goTo = (index) => {
    setCurrentIndex((index + banners.length) % banners.length);
  };

  const handleBannerClick = (banner) => {
    if (!banner.link) return;
    if (banner.link.startsWith("http://") || banner.link.startsWith("https://")) {
      window.open(banner.link, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = banner.link;
    }
  };

  if (loading) {
    return (
      <section className="w-full py-6 sm:py-8" aria-hidden>
        <div className="container-safe px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden bg-gray-200 animate-pulse aspect-[2.2/1] min-h-[180px] sm:min-h-[240px]" />
        </div>
      </section>
    );
  }

  if (!banners.length) return null;

  return (
    <section className="w-full py-6 sm:py-8" aria-label="Offers and promotions">
      <div className="container-safe px-4 sm:px-6 max-w-5xl mx-auto">
        <SaleCountdown />
        {/* Heading – only when we have banners */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <span
            className="block w-1 h-7 sm:h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: ACCENT }}
          />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Offers &amp; Promotions
          </h2>
        </div>

        {/* Carousel wrapper with rounded container */}
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                aria-label="Previous offer"
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 size-9 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7242a] transition-all"
              >
                <svg className="size-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                aria-label="Next offer"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 size-9 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7242a] transition-all"
              >
                <svg className="size-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="flex transition-transform duration-400 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="w-full flex-shrink-0">
                <BannerSlide
                  banner={banner}
                  onClick={() => handleBannerClick(banner)}
                />
              </div>
            ))}
          </div>

          {banners.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to offer ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className="rounded-full transition-all duration-300 h-1.5"
                  style={{
                    width: i === currentIndex ? 20 : 6,
                    backgroundColor: i === currentIndex ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BannerSlide({ banner, onClick }) {
  const hasRealTitle = !isPlaceholderTitle(banner.title);
  const displayTitle = hasRealTitle ? truncate(banner.title, 50) : "";
  const hasDesc = banner.description && String(banner.description).trim();
  const showOverlay = displayTitle || banner.link;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left block focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b7242a] focus:ring-offset-0"
    >
      <div className="relative w-full aspect-[2.2/1] min-h-[180px] sm:min-h-[240px] bg-gray-100 flex items-center justify-center">
        <img
          src={banner.imageUrl}
          alt={hasRealTitle ? banner.title : "Offer"}
          className="absolute inset-0 w-full h-full object-contain"
        />
        {showOverlay && (
          <div className="absolute inset-x-0 bottom-0 pt-12 pb-3 sm:pb-4 px-4 sm:px-5 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {displayTitle && (
                <p className="text-white font-semibold text-sm sm:text-base drop-shadow">
                  {displayTitle}
                </p>
              )}
              {banner.link && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium bg-white/20 text-white backdrop-blur-sm group-hover:bg-white/30 transition-colors"
                  style={{ marginLeft: displayTitle ? "auto" : 0 }}
                >
                  View offer
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        )}
        {hasDesc && <p className="sr-only">{banner.description}</p>}
      </div>
    </button>
  );
}
