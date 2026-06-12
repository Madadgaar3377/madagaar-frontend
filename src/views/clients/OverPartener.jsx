// src/pages/OurPartners.jsx
import React from "react";

/**
 * OurPartners page
 *
 * - Continuous horizontal marquee (as before)
 * - Individual logo animation is staggered so it appears like "one image moves at a time"
 * - Hovering pauses both marquee and individual-logo animations
 */

const ROWS = 1;
const REPEAT_COUNT = 12;

// Tweak these to change the visual effect quickly:
const LOGO_BOX = { width: 220, height: 140 }; // size of each logo slot
const INDIVIDUAL_DURATION = 2.8; // seconds for each logo's pulse/float animation
const STAGGER = 0.45; // seconds delay between each logo animation start

export default function OurPartners() {
  const images = [
    "/Media/Logo%201.png",
    "/Media/Logo%202.png",
    "/Media/Logo%203.png",
    "/Media/Logo%204.png",
    "/Media/Logo%205.png",
    "/Media/Logo%206.png",
    "/Media/Logo%207.png",
  ];

  const rowImages = (idx) =>
    new Array(REPEAT_COUNT)
      .fill(null)
      .map((_, i) => images[(i + idx) % images.length]);

  return (
    <div className="bg-gray-50 section-padding-sm">
      <div className="container-content space-y-8">
        <header className="text-center animate-on-scroll">
          <h1 className="text-responsive-xl font-extrabold text-gray-800">
            Our Partners
          </h1>
          <p className="mt-2 text-gray-500 max-w-2xl mx-auto text-responsive-sm">
            We proudly collaborate with trusted brands. Scroll to explore their
            logos  hover to pause.
          </p>
        </header>

        <section className="space-y-6">
          {new Array(ROWS).fill(null).map((_, rowIndex) => {
            const reverse = rowIndex % 2 === 1;
            const speed = 30 + rowIndex * 6;
            const animationName = `marquee-${rowIndex}`;

            // handlers pause/resume both marquee and individual logo animations
            const handleMouseEnter = (e) => {
              // pause marquee container (the flex strip)
              const strip = e.currentTarget.querySelector(".marquee-strip");
              if (strip) strip.style.animationPlayState = "paused";
              // pause every animated logo
              const logos = e.currentTarget.querySelectorAll(".logo-anim");
              logos.forEach((l) => (l.style.animationPlayState = "paused"));
            };
            const handleMouseLeave = (e) => {
              const strip = e.currentTarget.querySelector(".marquee-strip");
              if (strip) strip.style.animationPlayState = "running";
              const logos = e.currentTarget.querySelectorAll(".logo-anim");
              logos.forEach((l) => (l.style.animationPlayState = "running"));
            };

            return (
              <div
                key={rowIndex}
                className="overflow-hidden rounded-2xl"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                <div className="py-4">
                  <div
                    className="marquee-strip flex items-center gap-10 whitespace-nowrap"
                    style={{
                      animation: `${animationName} ${speed}s linear infinite`,
                      animationDirection: reverse ? "reverse" : "normal",
                      willChange: "transform",
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {rowImages(rowIndex).map((src, i) => {
                      // compute a staggered delay so animations appear one-by-one
                      const delay = `${(i % images.length) * STAGGER}s`;

                      return (
                        <div
                          key={i}
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{ width: LOGO_BOX.width, height: LOGO_BOX.height }}
                          aria-hidden={false}
                        >
                          <img
                            src={src}
                            alt={`partner-${rowIndex}-${i}`}
                            onError={(e) => {
                              const el = e.currentTarget;
                              el.onerror = null;
                              el.src =
                                "data:image/svg+xml;charset=UTF-8," +
                                encodeURIComponent(
                                  `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='128'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='14'>Partner</text></svg>`
                                );
                            }}
                            className="object-contain logo-anim"
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              // each logo runs the same keyframes but with a staggered start
                              animation: `logoMove ${INDIVIDUAL_DURATION}s ease-in-out ${delay} infinite`,
                              transformOrigin: "center center",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CSS keyframes injected per row (keeps marquee unique duration) */}
                <style>
                  {`
                    @keyframes ${animationName} {
                      0% { transform: translateX(0%); }
                      100% { transform: translateX(-50%); }
                    }

                    /* single-logo animation (float + slight scale) */
                    @keyframes logoMove {
                      0% { transform: translateY(0) scale(1); opacity: 1; }
                      40% { transform: translateY(-10px) scale(1.06); opacity: 1; }
                      60% { transform: translateY(-6px) scale(1.03); opacity: 1; }
                      100% { transform: translateY(0) scale(1); opacity: 1; }
                    }

                    /* Accessibility: reduce motion respects prefers-reduced-motion */
                    @media (prefers-reduced-motion: reduce) {
                      .marquee-strip { animation: none !important; }
                      .logo-anim { animation: none !important; }
                    }
                  `}
                </style>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
