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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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


    elements.forEach((element) => {
      observer.observe(element);
    });

    return observer;
  }

  // Enhanced luxury animations - New premium methods
  
  // Luxury slide animations
  static slideInFromLeft(element: HTMLElement, config: AnimationConfig = {}) {
    const { duration = 500, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config;
    
    return element.animate([
      { opacity: 0, transform: 'translateX(-40px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], {
      duration,
      easing,
      delay,
      fill: 'forwards'
    });
  }

  static slideInFromRight(element: HTMLElement, config: AnimationConfig = {}) {
    const { duration = 500, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config;
    
    return element.animate([
      { opacity: 0, transform: 'translateX(40px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], {
      duration,
      easing,
      delay,
      fill: 'forwards'
    });
  }

  // Luxury loading animation
  static createLoadingAnimation(element: HTMLElement) {
    return element.animate([
      { opacity: 0.7, transform: 'scale(1)' },
      { opacity: 1, transform: 'scale(1.02)' },
      { opacity: 0.7, transform: 'scale(1)' }
    ], {
      duration: 1500,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      iterations: Infinity
    });
  }

  // Premium shimmer effect for loading states
  static addShimmerEffect(element: HTMLElement) {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    
    const shimmer = document.createElement('div');
    shimmer.style.position = 'absolute';
    shimmer.style.top = '0';
    shimmer.style.left = '0';
    shimmer.style.width = '100%';
    shimmer.style.height = '100%';
    shimmer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)';
    shimmer.style.transform = 'translateX(-100%)';
    
    element.appendChild(shimmer);
    
    return shimmer.animate([
      { transform: 'translateX(-100%)' },
      { transform: 'translateX(100%)' }
    ], {
      duration: 2000,
      easing: 'ease-in-out',
      iterations: Infinity
    });
  }

  // Premium button press animation
  static addPremiumButtonAnimation(button: HTMLElement) {
    button.addEventListener('click', () => {
      button.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.95)' },
        { transform: 'scale(1)' }
      ], {
        duration: 200,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
    });
  }

  // Luxury card reveal animation
  static revealCard(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up') {
    const transforms = {
      up: 'translateY(40px)',
      down: 'translateY(-40px)',
      left: 'translateX(-40px)',
      right: 'translateX(40px)'
    };
    
    return element.animate([
      { 
        opacity: 0, 
        transform: `${transforms[direction]} scale(0.95)`,
        filter: 'blur(2px)'
      },
      { 
        opacity: 1, 
        transform: 'translateY(0) translateX(0) scale(1)',
        filter: 'blur(0px)'
      }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      fill: 'forwards'
    });
  }
}
