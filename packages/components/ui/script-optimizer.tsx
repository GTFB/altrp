"use client";

import Script from "next/script";

export const ScriptOptimizer = () => {
  return (
    <>
      {/* Critical scripts loaded immediately */}
      <Script
        id="critical-scripts"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Critical performance optimizations
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => {
                // Load non-critical resources when browser is idle
                const nonCriticalImages = document.querySelectorAll('img[data-lazy]');
                nonCriticalImages.forEach(img => {
                  img.src = img.dataset.src;
                  img.removeAttribute('data-lazy');
                });
              });
            }
            
          `,
        }}
      />

      {/* Non-critical scripts loaded after page load */}
      <Script
        id="non-critical-scripts"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Analytics and other non-critical scripts
            console.log('Non-critical scripts loaded');
            
            // Lazy load additional features
            if ('IntersectionObserver' in window) {
              const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    // Load additional content when visible
                    entry.target.classList.add('loaded');
                  }
                });
              });
              
              document.querySelectorAll('[data-observe]').forEach(el => {
                observer.observe(el);
              });
            }
          `,
        }}
      />
    </>
  );
};
