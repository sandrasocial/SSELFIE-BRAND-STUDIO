// Editorial Luxury Animation System
// Sophisticated micro-interactions for premium user experience

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export class EditorialAnimations {
  // Elegant scale animation for premium buttons and cards
  static createScaleAnimation(element: HTMLElement, scale = 1.02, config: AnimationConfig = {}) {
    const { duration = 300, easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' } = config;
    
    return element.animate([
      { transform: 'scale(1)' },
      { transform: `scale(${scale})` }
    ], {
      duration,
      easing,
      fill: 'forwards'
    });
  }

  // Sophisticated fade animations
  static fadeIn(element: HTMLElement, config: AnimationConfig = {}) {
    const { duration = 400, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config;
    
    return element.animate([
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration,
      easing,
      delay,
      fill: 'forwards'
    });
  }

  static fadeOut(element: HTMLElement, config: AnimationConfig = {}) {
    const { duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)' } = config;
    
    return element.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-10px)' }
    ], {
      duration,
      easing,
      fill: 'forwards'
    });
  }

  // Staggered animation for lists and grids
  static staggerChildren(container: HTMLElement, config: AnimationConfig = {}) {
    const children = Array.from(container.children) as HTMLElement[];
    const { delay = 100 } = config;
    
    children.forEach((child, index) => {
      this.fadeIn(child, { ...config, delay: index * delay });
    });
  }

  // Luxury hover effects
  static addHoverEffect(element: HTMLElement, scale = 1.05) {
    let isHovering = false;
    
    element.addEventListener('mouseenter', () => {
      if (!isHovering) {
        isHovering = true;
        this.createScaleAnimation(element, scale);
      }
    });
    
    element.addEventListener('mouseleave', () => {
      if (isHovering) {
        isHovering = false;
        this.createScaleAnimation(element, 1);
      }
    });
  }

  // Touch feedback for mobile
  static addTouchFeedback(element: HTMLElement) {
    let touchStarted = false;
    
    element.addEventListener('touchstart', () => {
      touchStarted = true;
      element.style.transform = 'scale(0.98)';
      element.style.transition = 'transform 150ms ease-out';
    });
    
    element.addEventListener('touchend', () => {
      if (touchStarted) {
        touchStarted = false;
        element.style.transform = 'scale(1)';
        element.style.transition = 'transform 200ms ease-out';
      }
    });
    
    element.addEventListener('touchcancel', () => {
      if (touchStarted) {
        touchStarted = false;
        element.style.transform = 'scale(1)';
        element.style.transition = 'transform 200ms ease-out';
      }
    });
  }

  // Parallax effect for backgrounds
  static createParallaxEffect(element: HTMLElement, speed = 0.5) {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      element.style.transform = `translateY(${parallax}px)`;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Return cleanup function
    return () => window.removeEventListener('scroll', handleScroll);
  }

  // Intersection Observer for scroll animations
  static observeInView(elements: HTMLElement[], config: AnimationConfig = {}) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.fadeIn(entry.target as HTMLElement, config);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px 0px -50px 0px'
    });

    elements.forEach(element => observer.observe(element));
    
    return observer;
  }
}