import React, { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

const SecondCards = () => {
  const stats = [
    { number: 15000, title: "Resolved", subtitle: "Cases" },
    { number: 100, title: "Worth of our", subtitle: "Success" },
    { number: 10000, title: "Happy Customers", subtitle: "across Pakistan" },
    { number: 3500, title: "Strong Partner", subtitle: "Network" },
  ];

  // refs for each card element
  const cardRefs = useRef([]);
  cardRefs.current = []; // ensure fresh array each render

  // keys state used to force remount of CountUp when card becomes visible
  const [countKeys, setCountKeys] = useState(() =>
    new Array(stats.length).fill(0)
  );
  const [visibleCards, setVisibleCards] = useState(new Set());

  // helper to attach refs in map
  const setRef = (el, i) => {
    cardRefs.current[i] = el;
  };

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // when element becomes visible (you can tweak threshold)
            if (entry.isIntersecting) {
              setVisibleCards((prev) => new Set([...prev, i]));
              setCountKeys((prev) => {
                const copy = [...prev];
                copy[i] = Date.now();
                return copy;
              });
            }
          });
        },
        {
          // tweak threshold to control when visibility triggers
          threshold: 0.4,
        }
      );

      observer.observe(el);
      return observer;
    });

    // cleanup
    return () => {
      observers.forEach((obs) => {
        if (obs && obs.disconnect) obs.disconnect();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div className="section-padding-sm">
      <div className="container-content responsive-grid-3 lg:grid-cols-4">
        {stats.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            ref={(el) => setRef(el, index)}
            className={`stat-card shadow-md p-6 text-center border border-gray-200 ${
              visibleCards.has(index) ? "animate-fade-in-up" : "animate-on-scroll"
            }`}
            style={{
              background: "rgba(183, 36, 42, 0.1)",
              borderRadius: "15px",
              ...(visibleCards.has(index) ? { animationDelay: `${index * 100}ms` } : {}),
            }}
          >
            <h2 className="text-4xl font-bold text-red-600 mb-2">
              {/* key changes whenever the card becomes visible, forcing remount */}
              <CountUp
                key={countKeys[index] || `init-${index}`}
                start={0}
                end={item.number}
                duration={2.2}
                separator=","
              />
            </h2>

            <p className="text-lg font-semibold text-gray-800">{item.title}</p>
            <p className="text-sm text-gray-500">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecondCards;
