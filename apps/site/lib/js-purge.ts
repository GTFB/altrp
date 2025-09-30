// JavaScript Purge utility for removing unused code
export const purgeUnusedJS = () => {
  if (typeof window === 'undefined') return;

  // List of critical functions that should never be purged
  const criticalFunctions = [
    'console', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval',
    'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll',
    'getElementById', 'getElementsByClassName', 'getElementsByTagName',
    'createElement', 'appendChild', 'removeChild', 'insertBefore',
    'classList', 'className', 'innerHTML', 'textContent', 'value',
    'focus', 'blur', 'click', 'submit', 'preventDefault', 'stopPropagation'
  ];

  // Get all script tags
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && !src.includes('critical') && !src.includes('above-the-fold')) {
      // Mark non-critical scripts for lazy loading
      script.setAttribute('data-lazy', 'true');
      (script as HTMLScriptElement).style.display = 'none';
      
      // Load when needed
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyScript = entry.target as HTMLScriptElement;
            lazyScript.style.display = 'block';
            observer.unobserve(lazyScript);
          }
        });
      });
      
      observer.observe(script);
    }
  });
};

// Tree shaking for unused modules
export const treeShakeModules = () => {
  if (typeof window === 'undefined') return;

  // List of modules that are actually used
  const usedModules = new Set<string>();
  
  // Scan DOM for used components
  const scanForUsedModules = (element: Element) => {
    // Check for React components
    const reactElements = element.querySelectorAll('[data-react-component]');
    reactElements.forEach(el => {
      const component = el.getAttribute('data-react-component');
      if (component) {
        usedModules.add(component);
      }
    });
    
    // Check for custom elements
    const customElements = element.querySelectorAll('[is]');
    customElements.forEach(el => {
      const customElement = el.getAttribute('is');
      if (customElement) {
        usedModules.add(customElement);
      }
    });
  };
  
  scanForUsedModules(document.body);
  
  // Log unused modules for debugging
  console.log('Used modules:', Array.from(usedModules));
};

// Bundle analyzer for development
export const analyzeBundle = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  let totalSize = 0;
  
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src) {
      // Estimate script size (this is approximate)
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            const size = parseInt(contentLength);
            totalSize += size;
            console.log(`Script: ${src}, Size: ${(size / 1024).toFixed(2)} KB`);
          }
        })
        .catch(() => {
          // Ignore CORS errors
        });
    }
  });
  
  setTimeout(() => {
    console.log(`Total JS size: ${(totalSize / 1024).toFixed(2)} KB`);
  }, 1000);
};

// Dynamic import for non-critical modules
export const loadModuleOnDemand = (moduleName: string) => {
  return import(`@/components/${moduleName}`)
    .then(module => {
      console.log(`Loaded module: ${moduleName}`);
      return module;
    })
    .catch(error => {
      console.warn(`Failed to load module: ${moduleName}`, error);
    });
};
