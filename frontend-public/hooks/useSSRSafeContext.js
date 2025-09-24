import { useContext, useEffect, useState } from 'react';

/**
 * A hook that safely handles context during SSR by providing default values
 * and only using the actual context after hydration
 */
export function useSSRSafeContext(Context, defaultValue) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Only call useContext after hydration to avoid SSR issues
  if (!isHydrated) {
    return defaultValue;
  }
  
  try {
    const contextValue = useContext(Context);
    return contextValue || defaultValue;
  } catch (error) {
    console.warn('Context not available, using default value:', error);
    return defaultValue;
  }
}

export default useSSRSafeContext;