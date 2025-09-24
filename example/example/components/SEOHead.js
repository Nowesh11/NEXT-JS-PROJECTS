import Head from 'next/head';

const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author = 'Tamil Language Society',
  siteName = 'Tamil Language Society',
  locale = 'en_US',
  alternateLocale = 'ta_IN'
}) => {
  const defaultTitle = 'Tamil Language Society - Preserving Tamil Heritage';
  const defaultDescription = 'Tamil Language Society is dedicated to preserving, promoting, and advancing Tamil language, literature, and culture worldwide through innovative projects and educational initiatives.';
  const defaultKeywords = 'Tamil language, Tamil culture, Tamil literature, Tamil education, Tamil heritage, Tamil society, Tamil books, Tamil ebooks, Tamil projects';
  const defaultImage = '/assets/og-image.jpg';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tamillanguagesociety.org';

  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image ? `${baseUrl}${image}` : `${baseUrl}${defaultImage}`;
  const seoUrl = url ? `${baseUrl}${url}` : baseUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en, ta" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={alternateLocale} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:site" content="@TamilLanguageSoc" />
      <meta name="twitter:creator" content="@TamilLanguageSoc" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="application-name" content={siteName} />
      
      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "description": seoDescription,
            "url": baseUrl,
            "logo": `${baseUrl}/assets/logo.png`,
            "image": seoImage,
            "sameAs": [
              "https://facebook.com/tamillanguagesociety",
              "https://twitter.com/TamilLanguageSoc",
              "https://instagram.com/tamillanguagesociety",
              "https://linkedin.com/company/tamil-language-society"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-XXX-XXX-XXXX",
              "contactType": "Customer Service",
              "availableLanguage": ["English", "Tamil"]
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            }
          })
        }}
      />
      
      {/* Structured Data - Website */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": baseUrl,
            "description": seoDescription,
            "inLanguage": ["en", "ta"],
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${baseUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
    </Head>
  );
};

export default SEOHead;