// components/shared/SecureIframe.tsx - Luxury iframe wrapper
import React from 'react';

interface SecureIframeProps {
  src: string;
  title: string;
  className?: string;
  height?: string;
}

export default function SecureIframe({ 
  src, 
  title, 
  className = "w-full h-96 border-0", 
  height = "400px" 
}: SecureIframeProps) {
  return (
    <iframe
      src={src}
      title={title}
      className={className}
      style={{ height }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}