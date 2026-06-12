// src/pages/CompareProducts.jsx
import React, { useEffect, useMemo, useState } from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { backendBaseUrl } from "../../../constants/apiUrl";
import CashPriceDisplay from "../../../components/CashPriceDisplay";
import { getProductPriceDisplay } from "../../../utils/installmentPricing";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const MAX_COMPARE = 4;

export default function CompareProducts() {
  const { id: routeId } = useParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [baseProduct, setBaseProduct] = useState(null);
  const [compareList, setCompareList] = useState([]); // base will be kept first if present
  const [related, setRelated] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [error, setError] = useState("");

  // helper to get unique id for product (consistent)
  const getId = (p) => {
    if (!p) return null;
    return p._id || p.installmentPlanId || p.productName || JSON.stringify(p);
  };

  // debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // search endpoint: optional filter by category (when base product has category)
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSearch(true);
      try {
        const params = new URLSearchParams();
        params.set("q", debouncedQuery);
        params.set("limit", "12");
        if (baseProduct?.category || baseProduct?.customCategory) {
          params.set("category", (baseProduct.category || baseProduct.customCategory || "").toString());
        }
        const res = await fetch(`${API}/getAllInstallments?${params.toString()}`);
        const body = await res.json().catch(() => null);
        let items = (body && (body.data || body)) || [];
        if (!Array.isArray(items) && items) items = [items];
        if (!cancelled) setSearchResults(items.slice(0, 12));
      } catch (err) {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setLoadingSearch(false);
      }
    })();
    return () => (cancelled = true);
  }, [debouncedQuery, baseProduct?.category, baseProduct?.customCategory]);

  // fetch a single product by id
  async function fetchProduct(identifier) {
    if (!identifier) return null;
    setLoadingProduct(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/getInstallment/${encodeURIComponent(identifier)}`
      );
      const body = await res.json().catch(() => null);
      let product = (body && (body.data || (body.success && body.data))) || body;
      if (Array.isArray(product)) product = product[0] || null;
      if (!product) throw new Error("Product not found");
      return product;
    } catch (err) {
      setError(err.message || "Failed to fetch product");
      return null;
    } finally {
      setLoadingProduct(false);
    }
  }

  // load base product from route param
  useEffect(() => {
    if (!routeId) {
      setBaseProduct(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const p = await fetchProduct(routeId);
      if (!cancelled && p) {
        setBaseProduct(p);
      }
    })();
    return () => (cancelled = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  // whenever baseProduct changes ensure compareList contains base as first and unique
  useEffect(() => {
    setCompareList((prev) => {
      const baseId = getId(baseProduct);
      // start with base if exists
      const next = [];
      if (baseProduct && baseId) next.push(baseProduct);
      // append previous items that are not base and dedupe
      const added = new Set(next.map(getId));
      for (const p of prev) {
        const id = getId(p);
        if (!added.has(id)) {
          added.add(id);
          next.push(p);
        }
      }
      // ensure length limit and return
      return next.slice(0, MAX_COMPARE);
    });
  }, [baseProduct]);

  // load related (small list) for quick suggestions
  useEffect(() => {
    if (!baseProduct) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const category =
        (baseProduct.category || baseProduct.customCategory || "").toString();
      const company = (baseProduct.companyName || baseProduct.companyNameOther || "")
        .toString();
      const limit = 8;
      const hits = new Map();

      async function tryFetch(q) {
        try {
          const res = await fetch(`${API}/getAllInstallments?${q}&limit=${limit}`);
          const body = await res.json().catch(() => null);
          const list = (body && (body.data || body)) || [];
          if (Array.isArray(list)) list.forEach((p) => hits.set(getId(p), p));
        } catch (e) {
          // ignore
        }
      }

      if (category) await tryFetch(`category=${encodeURIComponent(category)}`);
      if (company) await tryFetch(`companyName=${encodeURIComponent(company)}`);
      if (hits.size === 0) await tryFetch(`limit=${limit}`);

      const remKey = getId(baseProduct);
      if (remKey && hits.has(remKey)) hits.delete(remKey);

      if (!cancelled) setRelated(Array.from(hits.values()).slice(0, limit));
    })();
    return () => (cancelled = true);
  }, [baseProduct]);

  // add to compare list (deduped and keeps base first)
  const addToCompare = (p) => {
    if (!p) return;
    setCompareList((cur) => {
      const ids = new Set(cur.map(getId));
      const id = getId(p);
      if (ids.has(id)) return cur; // already present
      // if base exists, keep it first
      const baseId = getId(baseProduct);
      const newList = [...cur, p].filter(Boolean);
      // ensure unique by map
      const dedup = [];
      const seen = new Set();
      for (const item of newList) {
        const iid = getId(item);
        if (!seen.has(iid)) {
          seen.add(iid);
          dedup.push(item);
        }
      }
      // move base to front if exists
      if (baseId) {
        const idx = dedup.findIndex((it) => getId(it) === baseId);
        if (idx > 0) {
          const [b] = dedup.splice(idx, 1);
          dedup.unshift(b);
        }
      }
      return dedup.slice(0, MAX_COMPARE);
    });
  };

  // remove item
  const removeFromCompare = (p) => {
    const id = getId(p);
    setCompareList((cur) => cur.filter((c) => getId(c) !== id));
    // if removing base, also clear base
    if (baseProduct && getId(baseProduct) === id) {
      setBaseProduct(null);
      router.replace("/installments");
    }
  };

  const clearAll = () => {
    setCompareList([]);
    setBaseProduct(null);
    setRelated([]);
    setSearchResults([]);
    setQuery("");
    setError("");
    router.replace("/installments");
  };

  // Comparison rows: standard fields + Product Specifications (by category) from admin
  const comparisonRows = useMemo(() => {
    const rows = [
      { key: "productImages", label: "Images" },
      { key: "productName", label: "Name" },
      { key: "companyName", label: "Brand" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "downpayment", label: "Downpayment" },
      { key: "installment", label: "Monthly Installment" },
      { key: "tenure", label: "Tenure" },
    ];
    // Dynamic spec rows from productSpecifications.specifications (same structure as admin)
    const specFields = new Set();
    compareList.forEach((p) => {
      const specs = p.productSpecifications?.specifications;
      if (Array.isArray(specs)) {
        specs.forEach((s) => {
          const name = (s.field || s.label || "").toString().trim();
          if (name) specFields.add(name);
        });
      }
    });
    [...specFields].sort().forEach((field) => {
      rows.push({ key: `__spec_${field}`, label: field });
    });
    rows.push({ key: "description", label: "Short Description" });
    rows.push({ key: "__paymentPlans", label: "Payment Plans" });
    return rows;
  }, [compareList]);

  // helper get nested value
  function getByPath(obj, path) {
    if (!obj) return null;
    if (path === "__paymentPlans") return null;
    const parts = path.split(".");
    let cur = obj;
    for (let p of parts) {
      if (cur == null) return null;
      cur = cur[p];
    }
    return cur;
  }

  function renderCell(product, key) {
    if (!product) return null;
    if (key === "__paymentPlans") return null;
    // Product Specifications (from admin): __spec_FieldName
    if (key.startsWith("__spec_")) {
      const fieldName = key.replace(/^__spec_/, "");
      const specs = product.productSpecifications?.specifications;
      if (!Array.isArray(specs)) return <span className="text-xs text-gray-400"></span>;
      const spec = specs.find((s) => (s.field || s.label || "").toString().trim() === fieldName);
      const v = spec?.value;
      return <div className="text-sm text-gray-700">{v ?? <span className="text-xs text-gray-400"></span>}</div>;
    }
    const v = getByPath(product, key);
    if (key === "productImages") {
      const imgs = Array.isArray(product.productImages) ? product.productImages : [];
      if (!imgs.length) return <span className="text-xs text-gray-400"></span>;
      return (
        <div className="flex gap-2 flex-wrap">
          {imgs.slice(0, 3).map((s, i) => (
            <button key={i} type="button" onClick={() => setImgPreview(s)} className="size-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-red-300 transition shrink-0">
              <img src={s} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      );
    }
    if (key === "price") {
      const display = getProductPriceDisplay(product);
      if (!display.displayPrice) return <span className="text-xs text-gray-400"></span>;
      return <CashPriceDisplay display={display} size="sm" prefix="Rs." inline className="font-semibold" />;
    }
    if (["downpayment", "installment"].includes(key)) {
      if (v == null || v === "") return <span className="text-xs text-gray-400"></span>;
      return <span className="font-semibold">Rs. {Number(v).toLocaleString("en-PK")}</span>;
    }
    if (key === "description") {
      const txt = typeof v === "string" ? v.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 140) : "";
      return <div className="text-sm text-gray-700">{txt || <span className="text-xs text-gray-400"></span>}</div>;
    }
    return <div className="text-sm text-gray-700">{v ?? <span className="text-xs text-gray-400"></span>}</div>;
  }

  const showComparison = compareList.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 section-padding-sm">
      <div className="container-content space-y-4 sm:space-y-5 lg:space-y-6 max-w-7xl mx-auto">
        {/* header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <Link href="/installments" className="text-sm text-gray-500 hover:text-[rgb(183,36,42)] mb-2 inline-flex items-center gap-1">
              ← Back to Installments
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Compare Products
            </h1>
            <p className="text-sm text-gray-500 mt-1">Compare up to {MAX_COMPARE} products side by side by category</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button type="button" onClick={clearAll} className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition">
              Clear All
            </button>
          </div>
        </div>

        {/* base product hero card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square max-h-64 lg:max-h-none lg:h-56 flex items-center justify-center">
                {(baseProduct?.productImages?.[0]) ? (
                  <img src={baseProduct.productImages[0]} alt={baseProduct?.productName || "Product"} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {loadingProduct ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col gap-3 w-full max-w-sm">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ) : baseProduct ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">{baseProduct.productName}</h2>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-100">Base product</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{[baseProduct.companyName, baseProduct.category, baseProduct.city].filter(Boolean).join(" • ") || ""}</p>
                      <div className="mt-2">
                        <CashPriceDisplay display={getProductPriceDisplay(baseProduct)} size="md" prefix="Rs." />
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{(baseProduct.description || "").replace(/<[^>]+>/g, "").slice(0, 180)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => addToCompare(baseProduct)} className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm">
                        Add to compare
                      </button>
                      <button type="button" onClick={() => router.push(`/installment/${encodeURIComponent(baseProduct._id || baseProduct.installmentPlanId || "")}`)} className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600 transition">
                        View details
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">Monthly</div>
                      <div className="text-sm font-semibold text-gray-800">Rs. {Number(baseProduct.installment || 0).toLocaleString("en-PK")}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">Down payment</div>
                      <div className="text-sm font-semibold text-gray-800">Rs. {Number(baseProduct.downpayment || 0).toLocaleString("en-PK")}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">Tenure</div>
                      <div className="text-sm font-semibold text-gray-800">{baseProduct.tenure || ""}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">City</div>
                      <div className="text-sm font-semibold text-gray-800">{baseProduct.city || ""}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 sm:py-12 text-center">
                  <p className="text-gray-500 mb-2">No product selected to compare.</p>
                  <p className="text-sm text-gray-400">Search below or open a product from the installments page and click Compare.</p>
                  <Link href="/installments" className="inline-block mt-4 px-4 py-2 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition">Browse installments</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search / Add other products */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Add more products to compare</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or category..."
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button type="button" onClick={() => setDebouncedQuery(query)} className="px-5 py-3 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition shrink-0">
              Search
            </button>
          </div>

          {loadingSearch && <div className="mt-3 text-sm text-gray-500">Searching…</div>}

          {!loadingSearch && searchResults.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((s) => (
                <div key={getId(s)} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-red-200 hover:bg-red-50/30 transition flex gap-3">
                  <div className="size-20 rounded-lg overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
                    {s.productImages?.[0] ? (
                      <img src={s.productImages[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">No image</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{s.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-1">
                      <span>{s.companyName} •</span>
                      <CashPriceDisplay display={getProductPriceDisplay(s)} size="sm" prefix="Rs." inline />
                    </p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <button type="button"
                        onClick={() => {
                          const id = s._id || s.installmentPlanId || getId(s);
                          if (id) router.push(`/installment/product/CompareProduct/${encodeURIComponent(id)}`);
                          else setBaseProduct(s);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Set as base
                      </button>
                      <button type="button" onClick={() => addToCompare(s)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
                        Add to compare
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingSearch && debouncedQuery && searchResults.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">No results found. Try another search.</p>
          )}

          {baseProduct && related.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {baseProduct.category || baseProduct.customCategory ? "Same category – add to compare" : "Suggested products"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((r) => (
                  <div key={getId(r)} className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-red-200 hover:shadow-sm transition">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {r.productImages?.[0] ? (
                        <img src={r.productImages[0]} alt="" className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2 min-h-[2rem]">{r.productName}</p>
                      <CashPriceDisplay display={getProductPriceDisplay(r)} size="sm" prefix="Rs." className="mt-0.5" />
                      <div className="mt-2 flex gap-1.5">
                        <button type="button" onClick={() => addToCompare(r)} className="flex-1 text-xs py-1.5 rounded-lg bg-red-600 text-white font-medium">Add</button>
                        <button type="button" onClick={() => router.push(`/installment/product/CompareProduct/${encodeURIComponent(getId(r))}`)} className="flex-1 text-xs py-1.5 rounded-lg border border-gray-300 font-medium">Open</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* compare list chips */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Comparing ({compareList.length} of {MAX_COMPARE})</p>
          <div className="flex flex-wrap gap-2">
            {compareList.slice(0, MAX_COMPARE).map((p, idx) => (
              <div
                key={getId(p)}
                className={`flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl border bg-gray-50 ${idx === 0 ? "border-red-200 ring-1 ring-red-100" : "border-gray-200"}`}
              >
                <div className="size-8 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  {p.productImages?.[0] ? (
                    <img src={p.productImages[0]} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-gray-800 max-w-[120px] sm:max-w-[180px] truncate">{p.productName}</span>
                {idx !== 0 ? (
                  <button type="button" onClick={() => removeFromCompare(p)} className="p-1 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-600 transition" aria-label="Remove">×</button>
                ) : (
                  <span className="text-xs text-red-600 font-medium px-1.5">Base</span>
                )}
              </div>
            ))}
            {compareList.length < MAX_COMPARE && (
              <span className="text-sm text-gray-500 self-center">Add more from search above (max {MAX_COMPARE})</span>
            )}
          </div>
        </div>

        {/* comparison table */}
        {showComparison && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-semibold text-gray-900">Side-by-side comparison</h3>
              <p className="text-xs text-gray-500 mt-0.5">Features and specifications</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="p-3 sm:p-4 w-36 sm:w-44 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Feature</th>
                    {compareList.map((p) => (
                      <th key={getId(p)} className="p-3 sm:p-4 min-w-[200px] max-w-[260px] align-top border-r border-gray-100 last:border-r-0">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                            {p.productImages?.[0] ? <img src={p.productImages[0]} alt="" className="w-full h-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{p.productName}</p>
                            <p className="text-xs text-gray-500 truncate">{p.companyName}</p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, rowIdx) => (
                    <tr key={row.key} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="p-3 sm:p-4 text-sm font-medium text-gray-700 sticky left-0 z-10 border-r border-gray-200 bg-inherit">{row.label}</td>
                      {compareList.map((p) => (
                        <td key={getId(p) + row.key} className="p-3 sm:p-4 align-top border-r border-gray-100 last:border-r-0">
                          {row.key === "__paymentPlans" ? (
                            Array.isArray(p.paymentPlans) && p.paymentPlans.length ? (
                              <ul className="text-sm space-y-2">
                                {p.paymentPlans.map((pl, i) => (
                                  <li key={i} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                    <span className="font-medium text-gray-800">{pl.planName || `Plan ${i + 1}`}</span>
                                    <span className="block text-xs text-gray-600">Monthly: Rs. {Number(pl.monthlyInstallment || pl.installmentPrice || 0).toLocaleString("en-PK")}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : <span className="text-sm text-gray-400">No plans</span>
                          ) : (
                            renderCell(p, row.key)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* image preview modal */}
      {imgPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setImgPreview(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Image preview</span>
              <button type="button" onClick={() => setImgPreview(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">✕</button>
            </div>
            <img src={imgPreview} alt="Preview" className="w-full max-h-[70vh] object-contain p-4" />
          </div>
        </div>
      )}
    </div>
  );
}
