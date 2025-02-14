import { MutableRefObject, useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  scrollableRef?: MutableRefObject<HTMLDivElement>;
  onLoadMore: () => void;
  hasMore: boolean;
  threshold?: number;
}

export const useInfiniteScroll = ({
  scrollableRef,
  onLoadMore,
  hasMore,
  threshold = 100,
}: UseInfiniteScrollProps) => {
  useEffect(() => {
    // If scrollableRef isnt defined dont continue
    if (!scrollableRef) return;

    const handleScroll = () => {
      const container = scrollableRef.current;
      if (!container || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight <= threshold) {
        onLoadMore();
      }
    };

    const container = scrollableRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [onLoadMore, hasMore, threshold]);
};
