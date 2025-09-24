import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Contact from '../components/Contact';
import { useLanguage } from '../contexts/LanguageContext';

const ContactPage = () => {
  const { getText, language } = useLanguage();
  
  // Fallback function for server-side rendering
  const safeGetText = (key, fallback) => {
    if (typeof getText === 'function') {
      return getText(key, fallback);
    }
    return fallback;
  };

  return (
    <>
      <Head>
        <title>{safeGetText('contact.title', 'Contact Us')} - Tamil Literary Society</title>
        <meta name="description" content={safeGetText('contact.description', 'Get in touch with Tamil Literary Society. Contact us for inquiries, collaborations, or support.')} />
        <meta name="keywords" content="Tamil contact, literary society contact, Tamil support, collaboration" />
        <meta property="og:title" content={`${safeGetText('contact.title', 'Contact Us')} - Tamil Literary Society`} />
        <meta property="og:description" content={safeGetText('contact.description', 'Get in touch with Tamil Literary Society. Contact us for inquiries, collaborations, or support.')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/contact" />
      </Head>
      <Layout>
        <Contact getText={safeGetText} language={language} />
      </Layout>
    </>
  );
};

export default ContactPage;