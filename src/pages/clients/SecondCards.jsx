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
              // use timestamp to create a new key => remount CountUp
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
    <div className="flex items-center justify-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {stats.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            ref={(el) => setRef(el, index)}
            style={{
              background: "rgba(183, 36, 42, 0.1)",
              borderRadius: "15px",
            }}
            className="shadow-md p-6 text-center border border-gray-200 hover:shadow-xl transition-all duration-300"
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
