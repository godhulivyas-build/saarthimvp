import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

type Props = { permalink: string };

/** Official Instagram oEmbed (loads instagram.com/embed.js once, re-processes on permalink change). */
export const InstagramEmbed: React.FC<Props> = ({ permalink }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const process = () => window.instgrm?.Embeds.process();

    const existing = document.getElementById('instagram-embed-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = process;
      document.body.appendChild(script);
    } else {
      process();
    }
  }, [permalink]);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{ margin: 0, width: '100%', maxWidth: 400 }}
      />
    </div>
  );
};
