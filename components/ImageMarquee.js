import React, { useState, useEffect } from 'react';

export default function ImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = [
    '/tourist-signs.png',
    '/tourist-midjourney.png',
    '/tourist-copilot.png',
    '/tourist-dalle.png',
    '/tourist-notion.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="slider-container">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`AI Sign ${index}`}
          className={`slider-image ${index === activeIndex ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
