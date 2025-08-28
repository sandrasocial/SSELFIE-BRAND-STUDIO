import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMemoryCleanup } from './useMemoryCleanup';

interface VirtualizedGridConfig {
  itemHeight: number;
  containerHeight: number;
  columnsPerRow: number;
  overscan?: number;
}

interface GridItem {
  id: number;
  [key: string]: any;
}

/**
 * Phase 4: Advanced Virtualized Grid Hook
 * High-performance virtualization for large datasets
 */
export const useVirtualizedGrid = <T extends GridItem>(
  items: T[],
  config: VirtualizedGridConfig
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const { createTimeout, clearTimeout } = useMemoryCleanup();

  const {
    itemHeight,
    containerHeight,
    columnsPerRow,
    overscan = 3
  } = config;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const rowHeight = itemHeight;
    const totalRows = Math.ceil(items.length / columnsPerRow);
    
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    
    const startIndex = startRow * columnsPerRow;
    const endIndex = Math.min(items.length, endRow * columnsPerRow);
    
    return {
      startIndex,
      endIndex,
      startRow,
      endRow,
      totalHeight: totalRows * rowHeight
    };
  }, [items.length, scrollTop, containerHeight, itemHeight, columnsPerRow, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Optimized scroll handler with debouncing
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    
    if (!isScrolling) {
      setIsScrolling(true);
    }
    
    // Clear previous timeout
    const timeoutId = createTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    return () => clearTimeout(timeoutId);
  }, [isScrolling, createTimeout, clearTimeout]);

  // Get item position
  const getItemPosition = useCallback((index: number) => {
    const row = Math.floor(index / columnsPerRow);
    const col = index % columnsPerRow;
    
    return {
      top: row * itemHeight,
      left: col * (100 / columnsPerRow),
      width: 100 / columnsPerRow
    };
  }, [itemHeight, columnsPerRow]);

  return {
    visibleItems,
    visibleRange,
    totalHeight: visibleRange.totalHeight,
    isScrolling,
    handleScroll,
    getItemPosition
  };
};

export default useVirtualizedGrid;