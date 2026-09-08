'use client';

import { useEffect } from 'react';

export default function StructuredData() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "DU CMC Result System",
      "description": "Batch result lookup for Dhaka University Constituent Engineering Colleges and Medical Colleges",
      "applicationCategory": "Educational Application",
      "operatingSystem": "All",
      "url": "https://ducmcresult.vercel.app",
      "author": {
        "@type": "Person",
        "name": "Sultanum Mobin",
        "url": "https://sultanum-mobin.vercel.app/"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "127"
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}