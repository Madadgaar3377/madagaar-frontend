import React, { useState, useEffect, useCallback } from "react";
import { backendBaseUrl } from "../constants/apiUrl";

function pad(n) {
  return String(n).padStart(2, "0");
}

function useCountdown(saleEndAt) {
  const [left, setLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!saleEndAt) return;
    const end = new Date(saleEndAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, end - now);
      if (diff === 0) {
        setExpired(true);
        return;
      }
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      setLeft({ days, hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [saleEndAt]);

  return { ...left, expired };
}

export default function SaleCountdown() {
  const [saleEndAt, setSaleEndAt] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSaleEnd = useCallback(async () => {
    const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
    try {
      const res = await fetch(`${apiUrl}/getSaleEndTime`);
      const data = await res.json().catch(() => ({}));
      if (data.success && data.saleEndAt) {
        const end = new Date(data.saleEndAt);
        if (end > new Date()) setSaleEndAt(data.saleEndAt);
      }
    } catch (err) {
      console.error("SaleCountdown fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaleEnd();
  }, [fetchSaleEnd]);

  const { days, hours, minutes, seconds, expired } = useCountdown(saleEndAt);

  if (loading || !saleEndAt || expired) return null;

  return (
    <div className="w-full flex justify-center mb-6">
      <div
        className="inline-flex flex-col rounded-2xl overflow-hidden shadow-lg border border-purple-200"
        style={{
          background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #6d28d9 100%)",
        }}
      >
        <div
          className="px-4 py-2 text-center text-white font-bold text-sm sm:text-base"
          style={{ backgroundColor: "rgba(219, 39, 119, 0.9)" }}
        >
          Sale Ending in
        </div>
        <div className="flex items-center justify-center gap-1 sm:gap-2 p-4">
          <div className="flex flex-col items-center bg-black/20 rounded-xl px-3 sm:px-4 py-2 min-w-[52px] sm:min-w-[60px]">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">{pad(days)}</span>
            <span className="text-xs font-semibold text-white/90 uppercase">Days</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white/90 pb-4">:</span>
          <div className="flex flex-col items-center bg-black/20 rounded-xl px-3 sm:px-4 py-2 min-w-[52px] sm:min-w-[60px]">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">{pad(hours)}</span>
            <span className="text-xs font-semibold text-white/90 uppercase">Hours</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white/90 pb-4">:</span>
          <div className="flex flex-col items-center bg-black/20 rounded-xl px-3 sm:px-4 py-2 min-w-[52px] sm:min-w-[60px]">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">{pad(minutes)}</span>
            <span className="text-xs font-semibold text-white/90 uppercase">Minutes</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white/90 pb-4">:</span>
          <div className="flex flex-col items-center bg-black/20 rounded-xl px-3 sm:px-4 py-2 min-w-[52px] sm:min-w-[60px]">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">{pad(seconds)}</span>
            <span className="text-xs font-semibold text-white/90 uppercase">Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
