import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useSearchDebounce = (callback: (value: string) => void, delay: number = 2000) => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, delay);

  useEffect(() => {
    if (debouncedSearchValue !== undefined) {
      callback(debouncedSearchValue);
    }
  }, [debouncedSearchValue, callback]);

  return {
    searchValue,
    setSearchValue,
    debouncedSearchValue
  };
}; 