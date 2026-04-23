import React from 'react';

const images: { src: string; alt: string }[] = [
  { src: '/images/farmer.png', alt: 'Indian farmer working in field' },
  { src: '/images/community.png', alt: 'Farmers using technology together' },
  { src: '/images/agritech.png', alt: 'Modern agriculture with technology' },
  { src: '/images/field.png', alt: 'Farmers in green field with digital connection' },
];

export const AgriImages: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {images.map(({ src, alt }) => (
        <div key={src} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full aspect-[4/3] object-cover"
          />
        </div>
      ))}
    </div>
  );
};
