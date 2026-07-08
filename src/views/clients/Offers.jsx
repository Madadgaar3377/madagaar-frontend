"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { backendBaseUrl } from "../../constants/apiUrl";
import OfferBanner from "../../components/OfferBanner";
import AnimatedSection from "../../components/AnimatedSection";

const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");

function getProductLink(type, productId) {
  if (!productId) return "#";
  const enc = (x) => encodeURIComponent(x);
  switch (type) {
    case "installment":
      return `/installment/${enc(productId)}`;
    case "loan":
      return `/loans/${enc(productId)}`;
    case "property":
      return `/property/${enc(productId)}`;
    case "insurance":
      return `/insurance/${enc(productId)}`;
    default:
      return "#";
  }
}

function getProductLabel(type) {
  const labels = { installment: "Installment", loan: "Loan", property: "Property", insurance: "Insurance" };
  return labels[type] || type;
}

export default function OffersPage() {
  const [offerItems, setOfferItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOfferItems = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/getOfferItems`);
      const data = await res.json().catch(() => ({}));
      if (data.success && Array.isArray(data.data)) setOfferItems(data.data);
      else setOfferItems([]);
    } catch (err) {
      console.error("Offer items fetch error:", err);
      setOfferItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfferItems();
  }, [fetchOfferItems]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="section-padding container-content py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Offers &amp; Promotions</h1>
            <p className="text-gray-600 mb-8">Limited-time offers on installments, loans, properties, and insurance.</p>
            </AnimatedSection>

            {/* Offer items – products marked as on offer (sale countdown is inside OfferBanner below) */}
            {loading ? (
              <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center text-gray-500">
                Loading offers…
              </div>
            ) : offerItems.length > 0 ? (
              <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Products on offer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {offerItems.map((item) => {
                    const link = getProductLink(item.productType, item.productId);
                    const label = getProductLabel(item.productType);
                    const title = item.productTitle || item.productId;
                    const endsAt = item.saleEndAt ? new Date(item.saleEndAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "";
                    const imageUrl = item.imageUrl || null;
                    return (
                      <Link
                        key={item._id}
                        href={link}
                        className="block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-soft card-hover-lift text-left"
                      >
                        <div className="relative w-full aspect-[4/3] min-h-[180px] bg-gray-100 flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={title}
                              className="absolute inset-0 w-full h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                              <svg className="size-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                              </svg>
                              <span className="text-xs font-medium">{label}</span>
                            </div>
                          )}
                          <span className="absolute top-2 left-2 inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 shadow-sm">
                            {label}
                          </span>
                        </div>
                        <div className="p-4 sm:p-5">
                          <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[2.5rem]">{title}</h3>
                          {endsAt && (
                            <p className="text-xs text-gray-500 mt-2">Sale ends: {endsAt}</p>
                          )}
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 mt-3">
                            View offer
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              </AnimatedSection>
            ) : null}

            {/* Banners / promotions carousel */}
            <OfferBanner />
          </div>
        </div>
      </div>
    </>
  );
}
