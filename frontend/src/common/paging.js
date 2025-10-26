import { useEffect, useRef } from 'react';

export function useFurtherLoader({ loadMore, hasMore = true, isBusy = false, rootMargin = '800px 0px' }) {
  const ref = useRef(null);
  const ioRef = useRef(null);
  
  useEffect(() => {
    if (ioRef.current) { ioRef.current.disconnect(); ioRef.current = null; }
    if (!hasMore) return;
  
    const io = new IntersectionObserver(
      ([e]) => { if (!isBusy && e.isIntersecting) loadMore?.(); },
      { root: null, rootMargin, threshold: 0.01 }
    );
    
    ioRef.current = io;
  
    const el = ref.current;
    if (el) io.observe(el);
  
    return () => io.disconnect();
  }, [hasMore, isBusy, loadMore, rootMargin]);
  
  return { endRef: ref };
}
  
