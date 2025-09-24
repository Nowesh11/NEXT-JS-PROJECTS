import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/globals.css';
import '../styles/components.css';
import '../styles/modern-design.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    // Clean IDE webview query parameters to prevent navigation loops
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const hasIdeParams = url.searchParams.has('ide_webview_request_time');
      
      if (hasIdeParams) {
        // Remove the IDE webview parameter
        url.searchParams.delete('ide_webview_request_time');
        
        // Replace the URL without causing a navigation loop
        const cleanPath = url.pathname + (url.search || '');
        if (cleanPath !== router.asPath) {
          router.replace(cleanPath, undefined, { shallow: true });
        }
      }
    }
  }, [router]);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <div id="app-root">
              <Component {...pageProps} />
            </div>
          </LanguageProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}