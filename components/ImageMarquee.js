import React from 'react';

export default function ImageMarquee() {
  const images = [
    '/tourist-signs.png',
    '/tourist-midjourney.png',
    '/tourist-copilot.png',
    '/tourist-dalle.png',
    '/tourist-notion.png',
  ];

  // Zduplikujeme pole obrázků pro plynulý nekonečný efekt (seamless loop)
  const marqueeImages = [...images, ...images, ...images];

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {marqueeImages.map((src, index) => (
          <div key={index} className="marquee-item">
            <img src={src} alt={`AI Tourist Sign ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
