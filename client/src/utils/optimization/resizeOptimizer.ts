/**
 * Debounced Resize Handler
 */

export class ResizeOptimizer {
  private resizeHandlers: (() => void)[] = [];
  private debounceDelay: number = 100;
  private timeoutId: number | null = null;

  constructor(delay: number = 100) {
    this.debounceDelay = delay;
    this.setupResizeListener();
  }

  addHandler(handler: () => void) {
    this.resizeHandlers.push(handler);
  }

  removeHandler(handler: () => void) {
    const index = this.resizeHandlers.indexOf(handler);
    if (index > -1) {
      this.resizeHandlers.splice(index, 1);
    }
  }

  private setupResizeListener() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.resizeHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.warn('Resize handler error:', error);
        }
      });
    }, this.debounceDelay);
  }

  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.resizeHandlers = [];
  }
}