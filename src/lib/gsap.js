import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin with GSAP if in a browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Initializes scroll-triggered reveal animations on elements matching `[data-reveal]`.
 * Fades in and translates elements upward (y: 28px -> 0px) as they enter the viewport.
 *
 * Honors `prefers-reduced-motion` settings:
 * - If the user has requested reduced motion, all animations are bypassed completely,
 *   and elements are forced to full opacity immediately.
 */
export function initScrollReveal() {
  if (typeof window === 'undefined') return;

  // 1. Accessibility Check: Respect user's motion preferences
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    // Reveal all elements instantly without transition or transform
    const revealElements = document.querySelectorAll < HTMLElement > '[data-reveal]';
    revealElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
    });
    return;
  }

  // 2. Select all target elements
  const elements = gsap.utils.toArray < HTMLElement > '[data-reveal]';
  if (!elements || elements.length === 0) return;

  // 3. Batch reveal with ScrollTrigger for optimal performance and staggering
  ScrollTrigger.batch(elements, {
    interval: 0.1, // time window (in seconds) for batching elements
    batchMax: 6, // maximum elements to batch together
    start: 'top 90%', // trigger when top of element enters 90% from top of viewport
    once: true, // play animation once per page visit
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        {
          opacity: 0,
          y: 28,
          visibility: 'visible',
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power2.out',
          overwrite: 'auto',
        }
      );
    },
  });
}

// Auto-run if executed in a browser context and DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }

  // Re-initialize upon Astro View Transitions or dynamic navigation if used
  document.addEventListener('astro:page-load', () => {
    ScrollTrigger.refresh();
    initScrollReveal();
  });
}

export { gsap, ScrollTrigger };
export default gsap;
