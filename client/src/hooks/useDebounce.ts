import { useState, useEffect } from 'react';

const useDebounce = <T>(value: T, delayMs: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup the timeout if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
};

export default useDebounce;
