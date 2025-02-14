import { useState, useEffect, useRef } from 'react';

const useInView = <T extends HTMLElement>(
  condition: boolean = true,
  options: IntersectionObserverInit = {},
): [React.RefObject<T>, boolean] => {
  const [inView, setInView] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    // Do nothing if there's no more content to load (avoid setting up the observer)
    if (!condition || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is in view
        ...options,
      },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [elementRef, options, condition]);

  return [elementRef, inView];
};

export default useInView;
