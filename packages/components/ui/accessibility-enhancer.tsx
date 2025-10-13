"use client";

import { useEffect } from "react";

export const AccessibilityEnhancer = () => {
  useEffect(() => {
    // Skip during SSR or if already hydrated
    if (typeof window === 'undefined') return;
    
    // Enhance accessibility features
    const enhanceAccessibility = () => {
      // Add skip navigation link
      const skipLink = document.createElement('a') as HTMLAnchorElement;
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2563eb;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      `;
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);

      // Add main content landmark - only if not already set
      const mainContent = document.querySelector('main') || document.querySelector('#main-content');
      if (!mainContent) {
        // Create a separate main content element instead of modifying hero
        const mainElement = document.createElement('main');
        mainElement.id = 'main-content';
        mainElement.setAttribute('role', 'main');
        mainElement.style.cssText = 'position: relative; z-index: 1;';
        
        // Insert main element before hero
        const heroSection = document.querySelector('#hero') as HTMLElement;
        if (heroSection) {
          heroSection.parentNode?.insertBefore(mainElement, heroSection);
        }
      }

      // Enhance button accessibility
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach((button, index) => {
        if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
          button.setAttribute('aria-label', `Button ${index + 1}`);
        }
        
          // Remove focus indicators
          button.addEventListener('focus', () => {
            const htmlButton = button as HTMLElement;
            htmlButton.style.outline = 'none';
            htmlButton.style.outlineOffset = '0';
            htmlButton.style.boxShadow = 'none';
          });
          
          button.addEventListener('blur', () => {
            const htmlButton = button as HTMLElement;
            htmlButton.style.outline = 'none';
            htmlButton.style.outlineOffset = '0';
            htmlButton.style.boxShadow = 'none';
          });
      });

      // Enhance link accessibility
      const links = document.querySelectorAll('a');
      links.forEach((link, index) => {
        if (!link.getAttribute('aria-label') && !link.textContent?.trim()) {
          link.setAttribute('aria-label', `Link ${index + 1}`);
        }
        
        // Add external link indicators
        if (link.href && !link.href.startsWith(window.location.origin)) {
          link.setAttribute('aria-label', `${link.textContent || 'Link'} (opens in new tab)`);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });

      // Enhance heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let currentLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > currentLevel + 1) {
          console.warn(`Heading hierarchy issue: ${heading.tagName} follows h${currentLevel}`);
        }
        currentLevel = level;
      });

      // Add focus management for modals and dropdowns
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      
      const trapFocus = (element: Element) => {
        const focusableContent = element.querySelectorAll(focusableElements);
        
        // Check that there are focusable elements
        if (focusableContent.length === 0) return;
        
        const firstFocusableElement = focusableContent[0] as HTMLElement;
        const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

        element.addEventListener('keydown', (e: Event) => {
          const keyboardEvent = e as KeyboardEvent;
          if (keyboardEvent.key === 'Tab') {
            if (keyboardEvent.shiftKey) {
              if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                keyboardEvent.preventDefault();
              }
            } else {
              if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                keyboardEvent.preventDefault();
              }
            }
          }
        });
      };

      // Apply focus trapping to modals
      document.querySelectorAll('[role="dialog"], [role="alertdialog"]').forEach(trapFocus);

      // Add high contrast mode support
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
      if (prefersHighContrast.matches) {
        document.body.classList.add('high-contrast');
      }

      // Add reduced motion support
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        document.body.classList.add('reduced-motion');
      }

      // Add screen reader announcements
      const announceToScreenReader = (message: string) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      };

      // Make announcements available globally
      (window as any).announceToScreenReader = announceToScreenReader;
    };

    // Run accessibility enhancements after hydration
    const timeoutId = setTimeout(() => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceAccessibility);
      } else {
        enhanceAccessibility();
      }
    }, 100);

    // Add CSS for accessibility enhancements
    const style = document.createElement('style');
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: 8px 16px;
        margin: 0;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
      
      .high-contrast {
        filter: contrast(1.5);
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      /* Focus indicators */
      *:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }
      
      /* Skip link styles */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2563eb;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup if needed
      const skipLink = document.querySelector('.skip-link') as HTMLElement;
      if (skipLink) {
        skipLink.remove();
      }
    };
  }, []);

  return null;
};
