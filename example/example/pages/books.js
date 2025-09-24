import React from 'react';
import Head from 'next/head';
import Books from '../src/components/Books';

export default function BooksPage() {
  return (
    <>
      <Head>
        <title>Books Collection - TLS</title>
        <meta name="description" content="Discover our extensive collection of Tamil literature, educational books, and cultural publications." />
        <meta name="keywords" content="Tamil books, literature, education, cultural publications" />
      </Head>
      <Books />
    </>
  );
}