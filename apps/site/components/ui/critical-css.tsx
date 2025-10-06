"use client";

export const CriticalCSS = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical CSS for above-the-fold content */
        .hero-section {
          background-color: #7f1d1d;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero-content {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          padding: 0 0.75rem;
          position: relative;
          z-index: 10;
          height: 100%;
        }
        
        @media (min-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .hero-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        
        @media (min-width: 1024px) {
          .hero-text {
            text-align: left;
          }
        }
        
        .hero-title {
          margin-top: 1.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.025em;
          color: white;
        }
        
        @media (min-width: 640px) {
          .hero-title {
            font-size: 1.875rem;
          }
        }
        
        @media (min-width: 768px) {
          .hero-title {
            font-size: 2.25rem;
          }
        }
        
        @media (min-width: 1024px) {
          .hero-title {
            font-size: 3rem;
          }
        }
        
        @media (min-width: 1280px) {
          .hero-title {
            font-size: 3.25rem;
          }
        }
        
        .hero-description {
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: white;
        }
        
        @media (min-width: 640px) {
          .hero-description {
            font-size: 1rem;
          }
        }
        
        @media (min-width: 768px) {
          .hero-description {
            font-size: 1.125rem;
          }
        }
        
        .hero-image-container {
          width: 100%;
          height: 17.5rem;
          position: relative;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          align-self: end;
          overflow: hidden;
        }
        
        @media (min-width: 640px) {
          .hero-image-container {
            height: 37.5rem;
          }
        }
        
        @media (min-width: 640px) {
          .hero-image-container {
            align-items: end;
          }
        }
        
        /* Loading skeleton */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `
    }} />
  );
};
