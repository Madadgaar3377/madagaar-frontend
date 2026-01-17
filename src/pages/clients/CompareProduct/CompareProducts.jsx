// src/pages/CompareProducts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const MAX_COMPARE = 4;

export default function CompareProducts() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

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

  // search endpoint (native fetch)
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSearch(true);
      try {
        const url = `${API}/getAllInstallments?q=${encodeURIComponent(
          debouncedQuery
        )}&limit=12`;
        const res = await fetch(url);
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
  }, [debouncedQuery]);

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
      navigate("/installments", { replace: true });
    }
  };

  const clearAll = () => {
    setCompareList([]);
    setBaseProduct(null);
    setRelated([]);
    setSearchResults([]);
    setQuery("");
    setError("");
    navigate("/installments", { replace: true });
  };

  // dynamic rows depending on categories in compareList
  const comparisonRows = useMemo(() => {
    const cats = new Set(compareList.map((p) => (p.category || p.customCategory || "").toString().toLowerCase()));
    const isMobile = [...cats].some((c) => /phone|mobile|smartphone|cell/i.test(c));
    const isAC = [...cats].some((c) => /air|ac|conditioner/i.test(c));
    const isBike = [...cats].some((c) => /bike|motorcycle|bikes/i.test(c));
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
    if (isMobile) {
      rows.push(
        { key: "generalFeatures.operatingSystem", label: "OS" },
        { key: "performance.processor", label: "Processor" },
        { key: "display.screenSize", label: "Screen" },
        { key: "memory.internalMemory", label: "Storage" },
        { key: "memory.ram", label: "RAM" }
      );
    }
    if (isAC) {
      rows.push(
        { key: "airConditioner.brand", label: "AC Brand" },
        { key: "airConditioner.capacityInTon", label: "Capacity" }
      );
    }
    if (isBike) {
      rows.push({ key: "electricalBike.motorRatedPower", label: "Motor Power" });
      rows.push({ key: "mechanicalBike.generalFeatures.dimensions", label: "Dimensions" });
    }
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
    const v = getByPath(product, key);
    if (key === "productImages") {
      const imgs = Array.isArray(product.productImages) ? product.productImages : [];
      if (!imgs.length) return <span className="text-xs text-gray-400">—</span>;
      return (
        <div className="flex gap-2">
          {imgs.slice(0, 3).map((s, i) => (
            <img key={i} src={s} alt="" className="w-16 h-12 object-cover rounded cursor-pointer" onClick={() => setImgPreview(s)} />
          ))}
        </div>
      );
    }
    if (["price", "downpayment", "installment"].includes(key)) {
      if (v == null || v === "") return <span className="text-xs text-gray-400">—</span>;
      return <span className="font-semibold">Rs. {Number(v).toLocaleString("en-PK")}</span>;
    }
    if (key === "description") {
      const txt = typeof v === "string" ? v.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 140) : "";
      return <div className="text-sm text-gray-700">{txt || <span className="text-xs text-gray-400">—</span>}</div>;
    }
    return <div className="text-sm text-gray-700">{v ?? <span className="text-xs text-gray-400">—</span>}</div>;
  }

  const showComparison = compareList.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        {/* header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 bg-clip-text text-transparent">
              Compare Products
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Compare up to {MAX_COMPARE} products side by side</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={clearAll} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition">
              Clear All
            </button>
          </div>
        </div>

        {/* base product hero card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-gray-200 flex flex-col gap-3 sm:gap-4 lg:gap-6">
          <div className="w-full flex-shrink-0">
            <div className="rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-48 sm:h-56 lg:h-64 flex items-center justify-center">
              <img src={(baseProduct && baseProduct.productImages && baseProduct.productImages[0]) || ""} alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex-1">
            {loadingProduct ? (
              <div className="p-4 sm:p-6 text-center text-sm sm:text-base text-gray-500">Loading product...</div>
            ) : baseProduct ? (
              <>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="break-words">{baseProduct.productName}</span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-[rgba(183,36,42,0.12)] text-[rgb(183,36,42)] whitespace-nowrap">Base</span>
                    </h2>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1 break-words">{baseProduct.companyName} • {baseProduct.category} • {baseProduct.city}</div>
                    <div className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-800 font-semibold">Rs. {Number(baseProduct.price || 0).toLocaleString("en-PK")}</div>
                    <div className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-3">{(baseProduct.description || "").slice(0, 220).replace(/<\/?[^>]+(>|$)/g, "")}</div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <button onClick={() => addToCompare(baseProduct)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white font-medium hover:shadow-lg transition whitespace-nowrap">
                      ⚖️ Compare
                    </button>
                    <button onClick={() => navigate(`/installment/${encodeURIComponent(baseProduct._id || baseProduct.installmentPlanId || "")}`)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded-lg border-2 border-gray-300 hover:border-[rgb(183,36,42)] hover:text-[rgb(183,36,42)] transition font-medium whitespace-nowrap">
                      View Details
                    </button>
                  </div>
                </div>

                {/* small specs row */}
                <div className="mt-3 sm:mt-4 lg:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                    <div className="text-xs text-gray-400">Monthly</div>
                    <div className="font-medium">Rs. {Number(baseProduct.installment || 0).toLocaleString("en-PK")}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                    <div className="text-xs text-gray-400">Downpayment</div>
                    <div className="font-medium">Rs. {Number(baseProduct.downpayment || 0).toLocaleString("en-PK")}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                    <div className="text-xs text-gray-400">Tenure</div>
                    <div className="font-medium">{baseProduct.tenure || "-"}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                    <div className="text-xs text-gray-400">City</div>
                    <div className="font-medium">{baseProduct.city || "-"}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-gray-500">No base product selected. Use search below or open `/compare/:id`.</div>
            )}
          </div>
        </div>

        {/* Search / Add other products area */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products to compare..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-transparent transition"
              />
            </div>
            <button onClick={() => setDebouncedQuery(query)} className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white font-medium hover:shadow-lg transition whitespace-nowrap">
              Search
            </button>
          </div>

          {loadingSearch && <div className="mt-3 text-sm text-gray-500">Searching…</div>}

          {!loadingSearch && searchResults.length > 0 && (
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {searchResults.map((s) => (
                <div key={getId(s)} className="p-2 sm:p-3 rounded-lg border bg-white flex gap-2 sm:gap-3 items-start">
                  <img src={(s.productImages && s.productImages[0]) || ""} alt="" className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs sm:text-sm truncate">{s.productName}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{s.companyName} • Rs. {Number(s.price || 0).toLocaleString("en-PK")}</div>
                    <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2">
                      <button
                        onClick={async () => {
                          const id = getId(s);
                          if (id && id.length <= 24 && /^[0-9a-fA-F]+$/.test(id)) {
                            navigate(`/compare/${encodeURIComponent(id)}`);
                          } else if (s._id) {
                            navigate(`/compare/${encodeURIComponent(s._id)}`);
                          } else if (s.installmentPlanId) {
                            navigate(`/compare/${encodeURIComponent(s.installmentPlanId)}`);
                          } else {
                            // fallback: set as base locally
                            setBaseProduct(s);
                          }
                        }}
                        className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs bg-[rgb(183,36,42)] text-white whitespace-nowrap"
                      >
                        Set base
                      </button>

                      <button onClick={() => addToCompare(s)} className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs border whitespace-nowrap">Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingSearch && debouncedQuery && searchResults.length === 0 && (
            <div className="mt-4 text-sm text-gray-500">No results found.</div>
          )}

          {/* related quick suggestions (only if base exists) */}
          {baseProduct && related.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Suggested</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((r) => (
                  <div key={getId(r)} className="p-2 rounded-lg border bg-white">
                    <img src={(r.productImages && r.productImages[0]) || ""} alt="" className="w-full h-28 object-cover rounded" />
                    <div className="mt-2 text-xs font-medium">{r.productName}</div>
                    <div className="text-xs text-gray-500">Rs. {Number(r.price||0).toLocaleString("en-PK")}</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => addToCompare(r)} className="flex-1 text-xs py-1 rounded bg-[rgb(183,36,42)] text-white">Compare</button>
                      <button onClick={() => navigate(`/compare/${encodeURIComponent(getId(r))}`)} className="flex-1 text-xs py-1 rounded border">Open</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* compact compare chips */}
        <div className="flex gap-2 flex-wrap items-center">
          {compareList.slice(0, MAX_COMPARE).map((p, idx) => (
            <div key={getId(p)} className={`flex items-center gap-2 bg-white px-3 py-1 rounded-full border ${idx===0 ? "ring-2 ring-[rgba(183,36,42,0.12)]" : ""}`}>
              <img src={(p.productImages && p.productImages[0]) || ""} alt="" className="w-8 h-6 object-cover rounded" />
              <div className="text-sm font-medium">{p.productName}</div>
              {idx !== 0 && <button onClick={() => removeFromCompare(p)} className="text-xs px-2 py-0.5 rounded border">Remove</button>}
            </div>
          ))}
          {compareList.length < MAX_COMPARE && <div className="text-sm text-gray-500">Add up to {MAX_COMPARE} items to compare</div>}
        </div>

        {/* comparison table appears only when > 1 item */}
        {showComparison && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm border overflow-hidden">
            <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 px-2 sm:px-0">Comparison</div>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 sm:p-3 w-24 sm:w-32 lg:w-44 text-xs sm:text-sm text-gray-600 sticky left-0 bg-white z-10">Feature</th>
                    {compareList.map((p) => (
                      <th key={getId(p)} className="p-2 sm:p-3 text-left" style={{ minWidth: 180, maxWidth: 220 }}>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img src={(p.productImages && p.productImages[0]) || ""} alt="" className="w-10 h-8 sm:w-14 sm:h-11 object-cover rounded flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs sm:text-sm truncate">{p.productName}</div>
                            <div className="text-[10px] sm:text-xs text-gray-500 truncate">{p.companyName}</div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.key} className="">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border-r sticky left-0 z-10">{row.label}</td>
                      {compareList.map((p) => (
                        <td key={getId(p) + row.key} className="p-2 sm:p-3 align-top">
                          {row.key === "__paymentPlans" ? (
                            Array.isArray(p.paymentPlans) && p.paymentPlans.length ? (
                              <ul className="text-xs sm:text-sm space-y-1">
                                {p.paymentPlans.map((pl, i) => (
                                  <li key={i}><div className="font-medium text-xs sm:text-sm">{pl.planName || `Plan ${i+1}`}</div><div className="text-[10px] sm:text-xs text-gray-600">Monthly: Rs. {Number(pl.monthlyInstallment||pl.installmentPrice||0).toLocaleString("en-PK")}</div></li>
                                ))}
                              </ul>
                            ) : <div className="text-xs sm:text-sm text-gray-400">No plans</div>
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

        {error && <div className="text-sm text-red-500 mt-3">{error}</div>}
      </div>

      {/* image preview modal */}
      {imgPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setImgPreview(null)}>
          <div className="bg-white rounded-lg p-3 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end"><button onClick={() => setImgPreview(null)} className="px-3 py-1 rounded border">Close</button></div>
            <img src={imgPreview} alt="preview" className="w-full h-[60vh] object-contain mt-3" />
          </div>
        </div>
      )}
    </div>
  );
}
