// Performance Optimization Utilities
// Luxury quality image generation and loading optimizations

export interface PerformanceMetrics {
  imageLoadTime: number;
  totalPageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export class LuxuryPerformanceOptimizer {
  private static instance: LuxuryPerformanceOptimizer;
  private performanceObserver: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics = {
    imageLoadTime: 0,
    totalPageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0
  };

  static getInstance(): LuxuryPerformanceOptimizer {
    if (!LuxuryPerformanceOptimizer.instance) {
      LuxuryPerformanceOptimizer.instance = new LuxuryPerformanceOptimizer();
    }
    return LuxuryPerformanceOptimizer.instance;
  }

  // Initialize performance monitoring for luxury standards
  initializeMonitoring(): void {
    this.observeWebVitals();
    this.monitorImageLoading();
    this.setupLazyLoading();
  }

  // Observe Core Web Vitals for luxury performance
  private observeWebVitals(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                this.metrics.firstContentfulPaint = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              this.metrics.largestContentfulPaint = entry.startTime;
              break;
            case 'layout-shift':
              this.metrics.cumulativeLayoutShift += (entry as any).value;
              break;
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
    }
  }

  // Monitor image loading performance for sub-3-second target
  private monitorImageLoading(): void {
    const images = document.querySelectorAll('img');
    let totalLoadTime = 0;
    let loadedImages = 0;

    images.forEach((img) => {
      const startTime = performance.now();
      
      const onLoad = () => {
        const loadTime = performance.now() - startTime;
        totalLoadTime += loadTime;
        loadedImages++;
        
        if (loadedImages === images.length) {
          this.metrics.imageLoadTime = totalLoadTime / loadedImages;
          
          // Alert if luxury standard not met (3000ms target)
          if (this.metrics.imageLoadTime > 3000) {
            console.warn('⚠️ Image loading exceeds luxury standard (3s)');
          }
        }
      };

      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener('load', onLoad);
      }
    });
  }

  // Setup luxury lazy loading with intersection observer
  private setupLazyLoading(): void {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImageWithOptimization(img);
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  }

  // Load image with luxury optimization techniques
  private loadImageWithOptimization(img: HTMLImageElement): void {
    const startTime = performance.now();
    
    // Add luxury loading animation
    img.style.opacity = '0';
    img.style.transform = 'scale(1.05)';
    img.style.filter = 'blur(5px)';
    img.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';

    const onLoad = () => {
      const loadTime = performance.now() - startTime;
      
      // Luxury reveal animation
      requestAnimationFrame(() => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
        img.style.filter = 'blur(0px)';
      });
    };

    const onError = () => {
      console.error('❌ Image failed to load:', img.src);
      // Fallback with elegant error handling
      img.style.opacity = '0.5';
      img.style.filter = 'grayscale(100%)';
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    
    // Set the actual source
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
  }

  // Optimize image generation requests for luxury performance
  static optimizeImageGeneration(imageData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      // Add timeout for luxury standard (3 seconds)
      const timeout = setTimeout(() => {
        reject(new Error('Image generation exceeded luxury standard (3s)'));
      }, 3000);

      // Simulate image generation optimization
      // In real implementation, this would optimize the actual generation process
      const generateImage = async () => {
        try {
          // Simulate processing with luxury-grade optimization
          await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
          
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          clearTimeout(timeout);
          
          
          if (duration > 3000) {
            console.warn('⚠️ Image generation exceeded luxury standard');
          }
          
          // Return optimized image URL
          resolve('data:image/jpeg;base64,optimized_image_data_here');
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      generateImage();
    });
  }

  // Create luxury skeleton loaders
  static createLuxurySkeleton(container: HTMLElement, config: {
    count?: number;
    height?: string;
    animation?: boolean;
  } = {}): void {
    const { count = 1, height = '200px', animation = true } = config;
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `luxury-skeleton ${animation ? 'animate-premium-skeleton' : ''}`;
      skeleton.style.height = height;
      skeleton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      skeleton.style.borderRadius = '0.75rem';
      skeleton.style.marginBottom = 'var(--space-luxury-xs)';
      
      container.appendChild(skeleton);
    }
  }

  // Remove skeleton loaders with luxury animation
  static removeLuxurySkeleton(container: HTMLElement): void {
    const skeletons = container.querySelectorAll('.luxury-skeleton');
    
    skeletons.forEach((skeleton, index) => {
      setTimeout(() => {
        skeleton.style.opacity = '0';
        skeleton.style.transform = 'scale(0.95)';
        skeleton.style.transition = 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
        
        setTimeout(() => {
          skeleton.remove();
        }, 300);
      }, index * 100);
    });
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Check if performance meets luxury standards
  meetsLuxuryStandards(): boolean {
    const standards = {
      maxImageLoadTime: 3000,
      maxFirstContentfulPaint: 1500,
      maxLargestContentfulPaint: 2500,
      maxCumulativeLayoutShift: 0.1
    };

    return (
      this.metrics.imageLoadTime <= standards.maxImageLoadTime &&
      this.metrics.firstContentfulPaint <= standards.maxFirstContentfulPaint &&
      this.metrics.largestContentfulPaint <= standards.maxLargestContentfulPaint &&
      this.metrics.cumulativeLayoutShift <= standards.maxCumulativeLayoutShift
    );
  }

  // Generate performance report for luxury quality assurance
  generateLuxuryPerformanceReport(): {
    score: number;
    metrics: PerformanceMetrics;
    recommendations: string[];
    meetsStandards: boolean;
  } {
    const recommendations: string[] = [];
    let score = 100;

    if (this.metrics.imageLoadTime > 3000) {
      score -= 20;
      recommendations.push('Optimize image generation for sub-3-second performance');
    }

    if (this.metrics.firstContentfulPaint > 1500) {
      score -= 15;
      recommendations.push('Improve first contentful paint for luxury perception');
    }

    if (this.metrics.largestContentfulPaint > 2500) {
      score -= 15;
      recommendations.push('Optimize largest contentful paint for premium experience');
    }

    if (this.metrics.cumulativeLayoutShift > 0.1) {
      score -= 10;
      recommendations.push('Reduce layout shifts for luxury stability');
    }

    return {
      score: Math.max(0, score),
      metrics: this.getMetrics(),
      recommendations,
      meetsStandards: this.meetsLuxuryStandards()
    };
  }
}

// Auto-initialize for luxury performance monitoring
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    LuxuryPerformanceOptimizer.getInstance().initializeMonitoring();
  });
}