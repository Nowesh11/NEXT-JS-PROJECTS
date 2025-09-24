import { LanguageProvider } from '../contexts/LanguageContext';
import { CartProvider } from '../contexts/CartContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </LanguageProvider>
  );
}

export default MyApp;