// CSS optimization utilities
export const optimizeCSS = () => {
  // Remove unused CSS classes
  const removeUnusedCSS = () => {
    if (typeof window === 'undefined') return;
    
    const usedClasses = new Set<string>();
    const allElements = document.querySelectorAll('*');
    
    // Collect all used classes
    allElements.forEach(element => {
      if (element.className) {
        element.className.split(' ').forEach(cls => {
          if (cls.trim()) {
            usedClasses.add(cls.trim());
          }
        });
      }
    });
    
    // Remove unused stylesheets (this is a simplified approach)
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        const sheet = styleSheets[i];
        if (sheet.href && !sheet.href.includes('fonts.googleapis.com')) {
          // Check if stylesheet is critical
          const isCritical = sheet.href.includes('critical') || 
                           sheet.href.includes('above-the-fold');
          
          if (!isCritical) {
            // Mark for lazy loading
            const link = document.querySelector(`link[href="${sheet.href}"]`) as HTMLLinkElement;
            if (link) {
              link.media = 'print';
              link.onload = () => {
                link.media = 'all';
              };
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheets will throw errors
        console.warn('Cannot access stylesheet:', e);
      }
    }
  };
  
  // Optimize font loading
  const optimizeFonts = () => {
    if (typeof window === 'undefined') return;
    
    // Preload critical fonts
    const criticalFonts = [
      'Inter',
      'Playfair Display',
    ];
    
    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
      link.as = 'style';
      document.head.appendChild(link);
    });
  };
  
  // Optimize images
  const optimizeImages = () => {
    if (typeof window === 'undefined') return;
    
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" to images below the fold
      const rect = img.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        img.loading = 'lazy';
      }
      
      // Add decoding="async" for better performance
      img.decoding = 'async';
    });
  };
  
  // Run optimizations
  if (typeof window !== 'undefined') {
    // Run immediately for critical optimizations
    optimizeFonts();
    optimizeImages();
    
    // Run after page load for non-critical optimizations
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removeUnusedCSS);
    } else {
      removeUnusedCSS();
    }
  }
};

// Critical CSS injection
export const injectCriticalCSS = () => {
  if (typeof window === 'undefined') return;
  
  const criticalCSS = `
    /* Critical above-the-fold styles */
    .hero-section {
      background-color: #7f1d1d;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .hero-title {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      line-height: 1.2;
    }
    
    @media (min-width: 640px) {
      .hero-title {
        font-size: 2.5rem;
      }
    }
    
    @media (min-width: 1024px) {
      .hero-title {
        font-size: 3rem;
      }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
};
