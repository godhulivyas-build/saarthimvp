import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GalleryItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
}

interface ExpandableGalleryProps {
  items: GalleryItem[];
  className?: string;
}

/** Hover-to-expand horizontal gallery (photos + video) with a lightbox on click. */
export const ExpandableGallery: React.FC<ExpandableGalleryProps> = ({ items, className = '' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openItem = (index: number) => setSelectedIndex(index);
  const closeItem = () => setSelectedIndex(null);

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const getFlexValue = (index: number) => {
    if (hoveredIndex === null) return 1;
    return hoveredIndex === index ? 2 : 0.5;
  };

  return (
    <div className={className}>
      <div className="flex gap-2 h-72 md:h-96 w-full">
        {items.map((item, index) => (
          <motion.div
            key={item.src}
            className="relative cursor-pointer overflow-hidden rounded-xl"
            style={{ flex: 1 }}
            animate={{ flex: getFlexValue(index) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => openItem(index)}
          >
            {item.type === 'video' ? (
              <video src={item.src} className="w-full h-full object-cover" muted loop playsInline preload="metadata" />
            ) : (
              <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
            )}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredIndex === index ? 0 : 0.25 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeItem}
          >
            <button className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors" onClick={closeItem}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {items.length > 1 && (
              <button className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors" onClick={goToPrev}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <motion.div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
              {items[selectedIndex].type === 'video' ? (
                <motion.video
                  key={selectedIndex}
                  src={items[selectedIndex].src}
                  className="w-full h-full object-contain rounded-md max-h-[90vh]"
                  controls
                  autoPlay
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.img
                  key={selectedIndex}
                  src={items[selectedIndex].src}
                  alt={items[selectedIndex].alt}
                  className="w-full h-full object-contain rounded-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>

            {items.length > 1 && (
              <button className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors" onClick={goToNext}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-white/10 px-4 py-2 rounded-md">
              {selectedIndex + 1} / {items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
