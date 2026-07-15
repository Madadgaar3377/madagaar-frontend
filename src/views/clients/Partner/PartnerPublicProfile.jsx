"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { backendBaseUrl } from "../../../constants/apiUrl";
import styles from "./PartnerPublicProfile.module.css";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const MAX_COMPARE = 4;
const PAGE_LIMIT = 50;

const TYPE_LABELS = {
  installments: "Installments",
  property: "Properties",
  loan: "Loans",
  insurance: "Insurance",
};

const HUB_PATHS = {
  installments: "/installments",
  property: "/properties",
  loan: "/loans",
  insurance: "/insurance",
};

function currency(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return `Rs ${num.toLocaleString("en-PK")}`;
}

function digitsPhone(raw) {
  return String(raw || "").replace(/[^0-9]/g, "");
}

function VerifiedTick({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#16a34a" />
      <path
        d="M7.5 12.2l3 3.1 6-6.4"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Stable SSR/client shell — plain Tailwind only to avoid CSS-module hydration churn */
function SkeletonPage() {
  return (
    <div className="min-h-screen bg-[#f3f1ef]" suppressHydrationWarning>
      <div className="h-[42vh] min-h-[280px] bg-gradient-to-br from-[rgb(183,36,42)] to-red-900 animate-pulse" />
      <div className="max-w-6xl mx-auto px-4 -mt-8 space-y-4 pb-10">
        <div className="h-16 rounded-2xl bg-white/80 border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-white border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ item, selectable, selected, onToggle, disabledSelect, index }) {
  const price =
    item.discountedPrice != null && item.discountedPrice !== ""
      ? item.discountedPrice
      : item.price;
  const hasDiscount =
    item.discountedPrice != null &&
    item.price != null &&
    Number(item.discountedPrice) < Number(item.price);
  const hasPlans = (item.planCount || 0) > 0;

  return (
    <article
      className={`group ${styles.ppCard} ${selected ? styles.ppCardSelected : ""}`}
    >
      <div className="relative shrink-0 w-full aspect-[4/3] sm:aspect-[5/4] bg-[#faf9f8]">
        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
          <img
            src={item.image || "/placeholder.png"}
            alt={item.title || "Product"}
            className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>

        {selectable && (
          <button
            type="button"
            onClick={() => onToggle(item)}
            disabled={!selected && disabledSelect}
            aria-pressed={selected}
            className={`absolute top-2 left-2 z-10 min-h-[36px] px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition ${
              selected
                ? "bg-[rgb(183,36,42)] text-white border-[rgb(183,36,42)]"
                : "bg-white/95 text-gray-800 border-gray-200 disabled:opacity-40"
            }`}
          >
            {selected ? "Selected" : "Compare"}
          </button>
        )}

        {hasPlans ? (
          <span className="absolute top-2 right-2 z-10 bg-[rgb(183,36,42)] text-white text-[10px] font-bold px-2 py-1 rounded-md">
            {item.planCount} plan{item.planCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 min-w-0">
        <h3 className={`${styles.ppDisplay} text-[13px] sm:text-base font-bold text-[var(--pp-ink)] line-clamp-2 leading-snug min-h-[2.4rem]`}>
          {item.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-[var(--pp-muted)]">
          {item.category ? <span className="capitalize truncate max-w-[48%]">{item.category}</span> : null}
          {item.category && item.city ? <span aria-hidden>·</span> : null}
          {item.city ? <span className="truncate max-w-[48%]">{item.city}</span> : null}
        </div>

        <div className="mt-auto pt-1">
          <div className="text-[10px] uppercase tracking-wider text-[var(--pp-muted)] font-semibold mb-0.5">
            {item.type === "installments" ? "From" : "Price"}
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-xl font-extrabold text-[rgb(183,36,42)] tabular-nums">
              {currency(price)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-gray-400 line-through tabular-nums">
                {currency(item.price)}
              </span>
            ) : null}
          </div>
        </div>

        <Link
          href={item.href || "#"}
          className="mt-1 w-full min-h-[42px] inline-flex items-center justify-center rounded-xl bg-[rgb(183,36,42)] text-white text-sm font-semibold hover:bg-[rgb(160,28,34)] active:scale-[0.98] transition"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export default function PartnerPublicProfile() {
  const { id } = useParams();
  const router = useRouter();

  // Avoid SSR/client tree mismatch (CSS modules / fetch race during HMR)
  const [mounted, setMounted] = useState(false);
  const [shareDone, setShareDone] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [activeType, setActiveType] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [picBroken, setPicBroken] = useState(false);

  const companyName =
    profile?.companyDetails?.RegisteredCompanyName || profile?.name || "Partner";

  const visibleTypes = useMemo(() => {
    if (!profile) return [];
    const types = profile.visibleTypes?.length
      ? profile.visibleTypes
      : (profile.offeredTypes || []).filter(
          (t) => (profile.productCounts?.[t] || 0) > 0
        );
    return types.length ? types : profile.offeredTypes || [];
  }, [profile]);

  const totalListed = useMemo(() => {
    if (!profile?.productCounts) return 0;
    return (profile.offeredTypes || []).reduce(
      (sum, t) => sum + (profile.productCounts[t] || 0),
      0
    );
  }, [profile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) {
      if (mounted && !id) {
        setNotFound(true);
        setProfileLoading(false);
      }
      return;
    }
    const controller = new AbortController();
    (async () => {
      setProfileLoading(true);
      setProfileError("");
      setNotFound(false);
      try {
        const res = await fetch(
          `${API}/public/partner/${encodeURIComponent(id)}`,
          { signal: controller.signal }
        );
        const body = await res.json().catch(() => null);
        if (controller.signal.aborted) return;
        if (res.status === 404) {
          setNotFound(true);
          setProfile(null);
          return;
        }
        if (!res.ok || !body?.success) {
          throw new Error(body?.message || "Partner unavailable");
        }
        setProfile(body.data);
        setPicBroken(false);
        const nextTypes = body.data?.visibleTypes?.length
          ? body.data.visibleTypes
          : body.data?.offeredTypes || [];
        setActiveType(nextTypes[0] || null);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setProfileError(err.message || "Partner unavailable");
        setProfile(null);
      } finally {
        if (!controller.signal.aborted) setProfileLoading(false);
      }
    })();
    return () => controller.abort();
  }, [mounted, id]);

  const loadProducts = useCallback(
    async (type, page = 1, signal, q = "") => {
      if (!id || !type) {
        setProducts([]);
        return;
      }
      setProductsLoading(true);
      setProductsError("");
      try {
        const params = new URLSearchParams({
          type,
          page: String(page),
          limit: String(PAGE_LIMIT),
        });
        const trimmed = String(q || "").trim();
        if (trimmed) params.set("q", trimmed);
        const res = await fetch(
          `${API}/public/partner/${encodeURIComponent(id)}/products?${params}`,
          { signal }
        );
        const body = await res.json().catch(() => null);
        if (signal?.aborted) return;
        if (!res.ok || !body?.success) {
          throw new Error(body?.message || "Failed to load products");
        }
        setProducts(body.data?.items || []);
        setPagination(
          body.data?.pagination || {
            page: 1,
            limit: PAGE_LIMIT,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (err) {
        if (err?.name === "AbortError") return;
        setProductsError(err.message || "Failed to load products");
        setProducts([]);
      } finally {
        if (!signal?.aborted) setProductsLoading(false);
      }
    },
    [id]
  );

  // Debounce search input → query (resets to page 1)
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      setSearchQ(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [mounted, searchInput]);

  useEffect(() => {
    if (!mounted || !activeType) return;
    const controller = new AbortController();
    loadProducts(activeType, 1, controller.signal, searchQ);
    return () => controller.abort();
  }, [mounted, activeType, searchQ, loadProducts]);

  useEffect(() => {
    setSelectedIds([]);
    setSearchInput("");
    setSearchQ("");
  }, [activeType]);

  const toggleSelect = (item) => {
    if (item.type !== "installments") return;
    const pid = item.id;
    setSelectedIds((prev) => {
      if (prev.includes(pid)) return prev.filter((x) => x !== pid);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, pid];
    });
  };

  const openCompare = () => {
    if (selectedIds.length < 2) return;
    const [first, ...rest] = selectedIds;
    const qs = rest.length
      ? `?ids=${rest.map(encodeURIComponent).join(",")}`
      : "";
    router.push(
      `/installment/product/CompareProduct/${encodeURIComponent(first)}${qs}`
    );
  };

  const shareProfile = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: companyName,
          text: `Check out ${companyName} on Madadgaar`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareDone(true);
        setTimeout(() => setShareDone(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

  // Same tree on server + first client paint
  if (!mounted || profileLoading) {
    return <SkeletonPage />;
  }

  if (notFound || (!profile && profileError)) {
    return (
      <div className={styles.pp}>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className={`${styles.ppDisplay} text-6xl font-extrabold text-[rgb(183,36,42)] mb-3`}>
            {notFound ? "404" : "!"}
          </p>
          <h1 className={`${styles.ppDisplay} text-2xl font-bold mb-2`}>
            {notFound ? "Partner not found" : "Partner unavailable"}
          </h1>
          <p className="text-[var(--pp-muted)] mb-8 text-sm leading-relaxed">
            {notFound
              ? "This partner isn’t verified or the link is incorrect."
              : profileError || "Please try again in a moment."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/"
              className="min-h-[44px] px-5 inline-flex items-center rounded-xl bg-[rgb(183,36,42)] text-white font-semibold"
            >
              Go home
            </Link>
            <Link
              href="/installments"
              className="min-h-[44px] px-5 inline-flex items-center rounded-xl border border-gray-300 font-semibold bg-white"
            >
              Browse installments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <SkeletonPage />;

  const wa = digitsPhone(profile.WhatsappNumber || profile.phoneNumber);
  const phone = profile.phoneNumber || profile.WhatsappNumber || "";
  const website = profile.companyDetails?.OfficialWebsite || "";
  const address =
    profile.companyDetails?.HeadOfficeAddress || profile.Address || "";
  const partnerType = profile.companyDetails?.PartnerType || "";
  const hubHref = HUB_PATHS[activeType] || "/installments";
  const heroLetter = (companyName || "M").charAt(0).toUpperCase();

  return (
    <div className={`${styles.pp} ${styles.ppFade}`}>
      <section className={styles.ppHero}>
        <div className={styles.ppHeroMark} aria-hidden>
          {heroLetter}
        </div>
        <div
          className={`${styles.ppHeroInner} relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14`}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Madadgaar partner
            </p>
            <Link
              href="/"
              className="text-[11px] sm:text-xs font-semibold text-white/80 hover:text-white"
            >
              madadgaar.com.pk
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start sm:items-end">
            <div className="flex-shrink-0 relative">
              {profile.profilePic && !picBroken ? (
                <img
                  src={profile.profilePic}
                  alt=""
                  onError={() => setPicBroken(true)}
                  className="w-[5.5rem] h-[5.5rem] sm:w-28 sm:h-28 rounded-2xl object-cover bg-white ring-4 ring-white/25"
                />
              ) : (
                <div className="w-[5.5rem] h-[5.5rem] sm:w-28 sm:h-28 rounded-2xl bg-white/15 ring-4 ring-white/25 flex items-center justify-center text-3xl sm:text-4xl font-extrabold">
                  {heroLetter}
                </div>
              )}
              {profile.isVerified ? (
                <span
                  className="absolute -bottom-1.5 -right-1.5 sm:bottom-0 sm:right-0 flex items-center justify-center rounded-full bg-white p-0.5 shadow-md"
                  title="Verified partner"
                >
                  <VerifiedTick className="w-6 h-6 sm:w-7 sm:h-7" />
                </span>
              ) : null}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {profile.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16a34a] text-white text-[11px] sm:text-xs font-bold">
                    <VerifiedTick className="w-3.5 h-3.5" />
                    Verified partner
                  </span>
                ) : null}
                {partnerType ? (
                  <span className="text-[11px] sm:text-xs font-medium text-white/80">
                    {partnerType}
                  </span>
                ) : null}
              </div>

              <h1
                className={`${styles.ppDisplay} text-[1.85rem] sm:text-4xl lg:text-5xl font-extrabold leading-[1.05] mb-2 break-words inline-flex items-center gap-2 flex-wrap`}
              >
                <span>{companyName}</span>
                {profile.isVerified ? (
                  <VerifiedTick className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
                ) : null}
              </h1>

              <p className="text-sm sm:text-base text-white/85 max-w-xl leading-relaxed mb-5">
                {address
                  ? address
                  : `Browse this partner’s ${
                      (profile.offeredTypes || [])
                        .map((t) => TYPE_LABELS[t]?.toLowerCase() || t)
                        .join(", ") || "products"
                    } and contact them directly.`}
              </p>

              <div className="flex flex-wrap gap-2">
                {wa ? (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 inline-flex items-center justify-center rounded-xl bg-[#1fa855] text-white text-sm font-bold"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="min-h-[44px] px-4 inline-flex items-center justify-center rounded-xl bg-white text-[rgb(183,36,42)] text-sm font-bold"
                  >
                    Call now
                  </a>
                ) : null}
                {website ? (
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 inline-flex items-center justify-center rounded-xl border border-white/35 text-white text-sm font-semibold"
                  >
                    Website
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={shareProfile}
                  className="min-h-[44px] px-4 inline-flex items-center justify-center rounded-xl border border-white/35 text-white text-sm font-semibold"
                >
                  {shareDone ? "Copied" : "Share"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(profile.offeredTypes || []).length > 0 && (
        <div className="bg-white border-b border-[var(--pp-line)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex divide-x divide-[var(--pp-line)] overflow-x-auto">
              {(profile.offeredTypes || []).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveType(t)}
                  className={`flex-shrink-0 min-w-[30%] sm:min-w-0 sm:flex-1 py-3.5 sm:py-4 px-3 text-left transition ${
                    activeType === t ? "bg-red-50/60" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--pp-muted)] font-semibold">
                    {TYPE_LABELS[t] || t}
                  </div>
                  <div className={`${styles.ppDisplay} text-xl sm:text-2xl font-extrabold text-[rgb(183,36,42)] tabular-nums`}>
                    {profile.productCounts?.[t] ?? 0}
                  </div>
                </button>
              ))}
              <div className="hidden md:block flex-shrink-0 py-3.5 px-5 text-right ml-auto">
                <div className="text-[10px] uppercase tracking-wide text-[var(--pp-muted)] font-semibold">
                  Listed
                </div>
                <div className={`${styles.ppDisplay} text-xl font-extrabold tabular-nums`}>
                  {totalListed}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-5 sm:pt-8 pb-8">
        <div className="mb-4 sm:mb-5">
          <label className="sr-only" htmlFor="partner-product-search">
            Search this partner’s products
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pp-muted)] pointer-events-none" aria-hidden>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </span>
            <input
              id="partner-product-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search this partner’s ${
                TYPE_LABELS[activeType]?.toLowerCase() || "products"
              }…`}
              className="w-full min-h-[48px] pl-10 pr-24 rounded-xl border border-[var(--pp-line)] bg-white text-sm text-[var(--pp-ink)] placeholder:text-gray-400 focus:border-[rgb(183,36,42)] focus:ring-2 focus:ring-[rgba(183,36,42,0.15)] outline-none"
              autoComplete="off"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQ("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] px-3 rounded-lg text-xs font-semibold text-[var(--pp-muted)] hover:text-[rgb(183,36,42)] hover:bg-red-50"
              >
                Clear
              </button>
            ) : null}
          </div>
          {searchQ ? (
            <p className="mt-2 text-xs text-[var(--pp-muted)]">
              Showing results for “{searchQ}”
              {pagination.total != null ? (
                <span>
                  {" "}
                  · {pagination.total} found
                  {pagination.totalPages > 1
                    ? ` · page ${pagination.page}/${pagination.totalPages}`
                    : ""}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        {activeType === "installments" ? (
          <p className="text-[11px] sm:text-xs text-[var(--pp-muted)] mb-3 text-right">
            Select up to {MAX_COMPARE} to compare
          </p>
        ) : null}

        {visibleTypes.length > 1 ? (
          <div
            className="sticky top-0 z-30 -mx-3 sm:-mx-6 px-3 sm:px-6 bg-[var(--pp-paper)]/95 backdrop-blur-sm border-b border-[var(--pp-line)] mb-5"
            role="tablist"
          >
            <div className={styles.ppScrollX}>
              {visibleTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={activeType === t}
                  onClick={() => setActiveType(t)}
                  className={`${styles.ppTab} ${
                    activeType === t ? styles.ppTabActive : ""
                  }`}
                >
                  {TYPE_LABELS[t] || t}
                  {profile.productCounts?.[t] != null ? (
                    <span className="ml-1 opacity-70">
                      ({profile.productCounts[t]})
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : visibleTypes.length === 1 ? (
          <h2 className={`${styles.ppDisplay} text-lg sm:text-xl font-bold mb-4`}>
            {TYPE_LABELS[visibleTypes[0]] || visibleTypes[0]}
          </h2>
        ) : null}

        {productsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-[var(--pp-line)] aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        ) : productsError ? (
          <div className="rounded-2xl bg-white border border-red-100 p-8 text-center">
            <p className="text-red-600 font-medium mb-4 text-sm">{productsError}</p>
            <button
              type="button"
              onClick={() => loadProducts(activeType, pagination.page, undefined, searchQ)}
              className="min-h-[44px] px-5 rounded-xl bg-[rgb(183,36,42)] text-white text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[var(--pp-line)] px-6 py-14 text-center">
            <p className={`${styles.ppDisplay} text-lg font-bold mb-2`}>
              {searchQ ? "Not available" : "Nothing listed yet"}
            </p>
            <p className="text-sm text-[var(--pp-muted)] mb-5">
              {searchQ
                ? `No matching ${TYPE_LABELS[activeType]?.toLowerCase() || "products"} from this partner for “${searchQ}”.`
                : `No public ${TYPE_LABELS[activeType]?.toLowerCase() || "products"} right now.`}
            </p>
            {searchQ ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQ("");
                }}
                className="inline-flex min-h-[44px] px-5 items-center rounded-xl bg-[rgb(183,36,42)] text-white text-sm font-semibold"
              >
                Clear search
              </button>
            ) : (
              <Link
                href={hubHref}
                className="inline-flex min-h-[44px] px-5 items-center rounded-xl bg-[rgb(183,36,42)] text-white text-sm font-semibold"
              >
                Browse all on Madadgaar
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
              {products.map((item, index) => (
                <ProductCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  index={index}
                  selectable={
                    activeType === "installments" && item.type === "installments"
                  }
                  selected={selectedIds.includes(item.id)}
                  disabledSelect={selectedIds.length >= MAX_COMPARE}
                  onToggle={toggleSelect}
                />
              ))}
            </div>

            {pagination.totalPages > 1 ? (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white border border-[var(--pp-line)] p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-[var(--pp-muted)] text-center sm:text-left">
                  Page{" "}
                  <span className="font-bold text-[rgb(183,36,42)]">
                    {pagination.page}
                  </span>{" "}
                  of {pagination.totalPages}
                  <span className="hidden sm:inline">
                    {" "}
                    · {pagination.total} items · {PAGE_LIMIT}/page
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || productsLoading}
                    onClick={() =>
                      loadProducts(activeType, pagination.page - 1, undefined, searchQ)
                    }
                    className="min-h-[44px] px-4 rounded-xl border border-gray-300 text-sm font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || productsLoading
                    }
                    onClick={() =>
                      loadProducts(activeType, pagination.page + 1, undefined, searchQ)
                    }
                    className="min-h-[44px] px-4 rounded-xl border border-gray-300 text-sm font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}

        <section className="mt-10 sm:mt-14 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[rgb(183,36,42)] text-white px-5 sm:px-10 py-8 sm:py-10">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-white/70 mb-1">
                Madadgaar marketplace
              </p>
              <h2 className={`${styles.ppDisplay} text-xl sm:text-2xl font-extrabold`}>
                See more {TYPE_LABELS[activeType]?.toLowerCase() || "offers"}
              </h2>
            </div>
            <Link
              href={hubHref}
              className="min-h-[48px] px-6 inline-flex items-center justify-center rounded-xl bg-white text-[rgb(183,36,42)] text-sm font-bold shrink-0"
            >
              Browse catalog
            </Link>
          </div>
        </section>
      </main>

      {activeType === "installments" && selectedIds.length > 0 ? (
        <div className={styles.ppCompareBar}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 text-sm text-[var(--pp-muted)]">
              <span className="font-extrabold text-[rgb(183,36,42)]">
                {selectedIds.length}
              </span>
              <span className="mx-1">/</span>
              {MAX_COMPARE} selected
              {selectedIds.length < 2 ? (
                <span className="block sm:inline sm:ml-1 text-xs">
                  — pick at least 2
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="min-h-[44px] px-4 rounded-xl border border-gray-300 text-sm font-semibold"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={selectedIds.length < 2}
                onClick={openCompare}
                className="min-h-[44px] px-4 rounded-xl bg-[rgb(183,36,42)] text-white text-sm font-bold disabled:opacity-40"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
