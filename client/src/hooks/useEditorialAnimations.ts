import { useEffect, useRef } from 'react';
import { EditorialAnimations } from '../utils/editorialAnimations';

export function useEditorialAnimations() {
  const fadeInRef = useRef<HTMLDivElement>(null);
  const hoverScaleRef = useRef<HTMLDivElement>(null);
  const touchFeedbackRef = useRef<HTMLDivElement>(null);

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

  const addElement = (element: HTMLElement | null) => {
    if (element && !elementsRef.current.includes(element)) {
      elementsRef.current.push(element);
    }
  };

  return { addElement };
}
