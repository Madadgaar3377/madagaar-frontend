import React from "react";

export default function VideoPage() {
  return (
    <div className=" flex items-center justify-center  p-4">
      <div className="w-full max-w-6xl max-h-96  aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/FlRyziWo56U"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
