"use client";

import React, { useState } from "react";

const YOUTUBE_ID = "FlRyziWo56U";
const THUMB = `https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`;

/** Click-to-play YouTube embed — avoids continuous network activity until user opts in. */
export default function VideoPage() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex items-center justify-center section-padding-sm">
      <div className="w-full container-content max-w-6xl max-h-96 aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
        {playing ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
            title="YouTube video player"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="relative w-full h-full group"
            aria-label="Play Madadgaar video"
          >
            <img
              src={THUMB}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              width={1280}
              height={720}
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <span className="inline-flex items-center justify-center size-16 rounded-full bg-white/90 text-red-600 shadow-lg">
                <svg className="size-8 ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
