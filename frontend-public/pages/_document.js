import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags */}
        <meta httpEquiv="cache-control" content="no-cache" />
        <meta httpEquiv="expires" content="0" />
        <meta httpEquiv="pragma" content="no-cache" />
        <meta name="version" content="1.0" />
        <meta charSet="utf-8" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preconnect to external domains */}
        
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
        
        {/* Modern Font - Work Sans & Tamil Support */}
        
        
        {/* Custom animations */}
        <link rel="stylesheet" href="/styles/animations.css" />
        
        {/* Tailwind CSS with plugins */}
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        
        {/* Tailwind Configuration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    primary: "#137fec",
                    "background-light": "#f6f7f8",
                    "background-dark": "#101922",
                  },
                  fontFamily: {
                    display: ["Work Sans"],
                  },
                  borderRadius: {
                    DEFAULT: "0.25rem",
                    lg: "0.5rem",
                    xl: "0.75rem",
                    full: "9999px",
                  },
                  animation: {
                    blob: "blob 7s infinite",
                    "blob-delay": "blob 7s infinite 2s",
                  },
                  keyframes: {
                    blob: {
                      "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                      },
                      "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                      },
                      "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                      },
                      "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                      },
                    },
                  },
                },
              },
            };
          `
        }} />
        
        {/* Font Awesome */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </Head>
      <body className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
