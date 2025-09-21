import { useEffect, useRef } from 'react';
import { EditorialAnimations } from '../utils/editorialAnimations';

// React hook for editorial animations with proper cleanup
export function useEditorialAnimations() {
  const fadeInRef = useRef<HTMLElement>(null);
  const hoverScaleRef = useRef<HTMLElement>(null);
  const touchFeedbackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (fadeInRef.current) {
      EditorialAnimations.fadeIn(fadeInRef.current);
    }
  }, []);

  useEffect(() => {
    if (hoverScaleRef.current) {
      EditorialAnimations.addHoverEffect(hoverScaleRef.current);
    }
  }, []);

  useEffect(() => {
    if (touchFeedbackRef.current) {
      EditorialAnimations.addTouchFeedback(touchFeedbackRef.current);
    }
  }, []);

  return {
    fadeInRef,
    hoverScaleRef,
    touchFeedbackRef,
  };
}

// Hook for parallax effects with proper cleanup
export function useParallaxEffect(speed = 0.5) {
  const elementRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      cleanupRef.current = EditorialAnimations.createParallaxEffect(
        elementRef.current, 
        speed
      );
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [speed]);

  return elementRef;
}

// Hook for staggered list animations
export function useStaggerAnimation(itemCount: number) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current && itemCount > 0) {
      // Small delay to ensure all children are rendered
      setTimeout(() => {
        if (containerRef.current) {
          EditorialAnimations.staggerChildren(containerRef.current);
        }
      }, 100);
    }
  }, [itemCount]);

  return containerRef;
}

// Hook for intersection observer animations
export function useScrollAnimation() {
  const elementsRef = useRef<HTMLElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (elementsRef.current.length > 0) {
      observerRef.current = EditorialAnimations.observeInView(elementsRef.current);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      elementsRef.current = [];
    };
  }, []);

  const addElement = (element: HTMLElement | null) => {
    if (element && !elementsRef.current.includes(element)) {
      elementsRef.current.push(element);
    }
  };

  return { addElement };
}