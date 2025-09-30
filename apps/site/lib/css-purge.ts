// CSS Purge utility for removing unused styles
export const purgeUnusedCSS = () => {
  if (typeof window === 'undefined') return;

  // List of critical CSS classes that should never be purged
  const criticalClasses = [
    'container', 'mx-auto', 'px-4', 'py-8', 'text-center', 'text-left',
    'bg-red-500', 'bg-white', 'text-white', 'text-black', 'font-bold',
    'rounded', 'shadow', 'flex', 'grid', 'hidden', 'block', 'inline',
    'w-full', 'h-full', 'min-h-screen', 'max-w-4xl', 'space-y-4',
    'mt-4', 'mb-4', 'pt-4', 'pb-4', 'pl-4', 'pr-4',
    'sm:', 'md:', 'lg:', 'xl:', '2xl:'
  ];

  // Get all stylesheets
  const stylesheets = Array.from(document.styleSheets);
  
  stylesheets.forEach(sheet => {
    try {
      // Only process external stylesheets
      if (sheet.href && !sheet.href.includes('fonts.googleapis.com')) {
        const rules = Array.from(sheet.cssRules || []);
        
        rules.forEach(rule => {
          if (rule.type === CSSRule.STYLE_RULE) {
            const styleRule = rule as CSSStyleRule;
            const selector = styleRule.selectorText;
            
            // Check if selector is used in DOM
            if (selector && !isSelectorUsed(selector, criticalClasses)) {
              // Mark rule for removal (in real implementation, you'd remove it)
              console.log(`Unused CSS rule: ${selector}`);
            }
          }
        });
      }
    } catch (e) {
      // Cross-origin stylesheets will throw errors
      console.warn('Cannot access stylesheet:', e);
    }
  });
};

// Check if a CSS selector is used in the DOM
const isSelectorUsed = (selector: string, criticalClasses: string[]): boolean => {
  // Skip critical classes
  if (criticalClasses.some(critical => selector.includes(critical))) {
    return true;
  }

  // Skip pseudo-selectors and complex selectors
  if (selector.includes(':') || selector.includes('[') || selector.includes(' ')) {
    return true;
  }

  // Check if class exists in DOM
  const className = selector.replace('.', '');
  return document.querySelector(`.${className}`) !== null;
};

// Critical CSS injection for above-the-fold content
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
    
    /* Touch targets */
    .touch-target {
      min-height: 48px;
      min-width: 48px;
    }
    
    /* Loading states */
    .loading {
      opacity: 0.6;
      pointer-events: none;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
};
