'use client';

import { useEffect, useRef } from 'react';

export default function MarketingHome() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Ensure iframe fills the viewport
    const handleResize = () => {
      if (iframeRef.current) {
        iframeRef.current.style.height = window.innerHeight + 'px';
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/marketing/index.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="StaySteward"
    />
  );
}
