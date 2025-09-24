import { useState, useEffect } from 'react';

/**
 * A component that only renders its children on the client side
 * This prevents SSR hydration mismatches for components that use browser-only APIs
 */
export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}