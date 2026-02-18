import React, { useState, useEffect, useCallback } from "react";
import { backendBaseUrl } from "../constants/apiUrl";

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

/** Placeholder titles from admin (e.g. default "Hero Slider") – don't show as heading */
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
      <section className="w-full py-8 sm:py-10" aria-hidden>
        <div className="container-safe px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="h-7 w-40 rounded-md bg-gray-200 animate-pulse mb-5" />
          <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-gray-200 animate-pulse h-48 sm:h-64" />
        </div>
      </section>
    );
  }

  if (!banners.length) return null;

  const current = banners[currentIndex];

  return (
    <section className="w-full py-8 sm:py-10 bg-gradient-to-b from-gray-50/80 to-white" aria-label="Offers and promotions">
      <div className="container-safe px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <span
            className="block w-1 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: ACCENT }}
          />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Special Offers & Promotions
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          {/* Prev / Next */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                aria-label="Previous offer"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7242a] transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                aria-label="Next offer"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7242a] transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

          {/* Dots */}
          {banners.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to offer ${i + 1}`}
                  onClick={() => setCurrentIndex(i)}
                  className="rounded-full transition-all duration-300 h-2"
                  style={{
                    width: i === currentIndex ? 24 : 8,
                    backgroundColor: i === currentIndex ? ACCENT : `rgba(${ACCENT_RGB}, 0.25)`,
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
  const displayTitle = hasRealTitle ? truncate(banner.title, 48) : "";
  const hasDesc = banner.description && String(banner.description).trim();
  const showOverlay = displayTitle || banner.link;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left block rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7242a]"
    >
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] min-h-[180px] sm:min-h-[220px]">
        <img
          src={banner.imageUrl}
          alt={hasRealTitle ? banner.title : "Offer"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Bottom overlay: only when there's a real title or link */}
        {showOverlay && (
          <div
            className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 sm:px-6 bg-gradient-to-t from-black/75 via-black/40 to-transparent"
          >
            {displayTitle && (
              <p className="text-white font-semibold text-base sm:text-lg drop-shadow-sm">
                {displayTitle}
              </p>
            )}
            {banner.link && (
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium text-white/95 group-hover:text-white ${displayTitle ? "mt-1.5" : ""}`}>
                View offer
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            )}
          </div>
        )}
        {hasDesc && (
          <p className="sr-only">{banner.description}</p>
        )}
      </div>
    </button>
  );
}
