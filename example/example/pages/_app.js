import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AccessibilityProvider } from '../components/AccessibilityProvider';
import { ContentProvider } from '../contexts/ContentContext';
import '../styles/globals.css';
import '../styles/components.css';
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
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
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
  }, []);

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