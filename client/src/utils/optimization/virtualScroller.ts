/**
 * Virtual Scrolling for Large Lists
 */

export class VirtualScroller {
  private container: HTMLElement;
  private items: any[];
  private itemHeight: number;
  private visibleCount: number;
  private startIndex = 0;
  private renderItem: (item: any, index: number) => HTMLElement;

  constructor(
    container: HTMLElement,
    items: any[],
    itemHeight: number,
    renderItem: (item: any, index: number) => HTMLElement
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
    
    this.setupScrolling();
  }

  private setupScrolling() {
    const totalHeight = this.items.length * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';

    this.container.addEventListener('scroll', () => {
      const scrollTop = this.container.scrollTop;
      const newStartIndex = Math.floor(scrollTop / this.itemHeight);
      
      if (newStartIndex !== this.startIndex) {
        this.startIndex = newStartIndex;
        this.render();
      }
    });

    this.render();
  }

  private render() {
    // Clear existing items
    this.container.innerHTML = '';
    
    const endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
    
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = this.renderItem(this.items[i], i);
      item.style.position = 'absolute';
      item.style.top = `${i * this.itemHeight}px`;
      item.style.height = `${this.itemHeight}px`;
      item.style.width = '100%';
      this.container.appendChild(item);
    }
  }

  updateItems(newItems: any[]) {
    this.items = newItems;
    const totalHeight = this.items.length * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;
    this.render();
  }
}