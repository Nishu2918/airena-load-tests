import { useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
    wheelMultiplier?: number;
  };
}

export function SmoothScroll({ children, options }: SmoothScrollProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8, // Reduced from 1.2 for faster, more responsive scrolling
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 0.5, // Reduced scroll distance per wheel event
      ...options,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Intercept wheel events to allow scrollable containers to handle their own scroll
    // This runs in capture phase BEFORE Lenis's handlers
    const handleWheelCapture = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      // Check if the event is over a scrollable container
      const scrollableContainer = target.closest('[data-scrollable]') || 
                                   target.closest('.overflow-y-auto') ||
                                   target.closest('.overflow-auto');
      
      if (scrollableContainer) {
        const container = scrollableContainer as HTMLElement;
        const isScrollable = container.scrollHeight > container.clientHeight;
        
        if (isScrollable) {
          const isAtTop = container.scrollTop <= 0;
          const isAtBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 1;
          
          // If container can scroll and is not at boundaries, prevent Lenis from handling it
          if (!(isAtTop && e.deltaY < 0) && !(isAtBottom && e.deltaY > 0)) {
            // Stop propagation to prevent Lenis from intercepting
            e.stopPropagation();
            // Don't preventDefault - let browser handle native scroll
            return;
          }
        }
      }
    };

    // Use capture phase to intercept BEFORE Lenis's handlers
    // Non-passive allows us to stop propagation
    document.addEventListener('wheel', handleWheelCapture, { passive: false, capture: true });

    return () => {
      lenis.destroy();
      document.removeEventListener('wheel', handleWheelCapture, { capture: true } as EventListenerOptions);
    };
  }, [options]);

  return <>{children}</>;
}

