import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/router';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AccessibilityProvider } from '../components/AccessibilityProvider';
import { ContentProvider } from '../contexts/ContentContext';
import '../styles/globals.css';
import '../styles/components.css';
import '../styles/responsive.css';
import '../styles/performance.css';
import '../styles/accessibility.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

    // Initialize AOS with accessibility considerations
    // AOS will be disabled automatically by AccessibilityProvider if reduced motion is preferred
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      disable: false, // Let AccessibilityProvider handle this
      offset: 50,
      delay: 0,
    });
  }, [router]);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <ContentProvider>
              <AccessibilityProvider>
                <div id="app-root">
                  <Component {...pageProps} />
                </div>
              </AccessibilityProvider>
            </ContentProvider>
          </LanguageProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
